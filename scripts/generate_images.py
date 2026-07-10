"""
Gold Home HP用の画像自動生成スクリプト
Gemini 2.5 Flash Image (Nano Banana) を使用

使い方:
    # 1枚だけテスト生成（IDを指定）
    uv run python generate_images.py --test 01_hero_A

    # 全18枚を生成
    uv run python generate_images.py --all

    # 特定IDを再生成
    uv run python generate_images.py --id 15_flow_meeting

    # 未生成のもののみ生成
    uv run python generate_images.py --missing
"""

import argparse
import json
import os
import sys
import time
from io import BytesIO
from pathlib import Path

# Windows cp932環境でも絵文字を出せるようUTF-8に切替
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image

SCRIPT_DIR = Path(__file__).parent
REPO_ROOT = SCRIPT_DIR.parent
PROMPTS_FILE = SCRIPT_DIR / "prompts.json"


def load_config():
    """環境変数からAPIキー等を読み込む"""
    load_dotenv(SCRIPT_DIR / ".env")
    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-image-preview")
    if not api_key or api_key.startswith("ここに"):
        print("❌ .env に GEMINI_API_KEY が設定されていません")
        sys.exit(1)
    return api_key, model


def generate_one(client, model, prompt_data, force=False):
    """1枚生成"""
    out_path = REPO_ROOT / prompt_data["output"]

    if out_path.exists() and not force:
        print(f"  ⏭  スキップ（既存）: {prompt_data['id']} → {out_path.name}")
        return "skipped"

    out_path.parent.mkdir(parents=True, exist_ok=True)

    prompt = prompt_data["prompt"]
    print(f"  🎨 生成中: {prompt_data['id']} ({prompt_data['aspect']})")

    try:
        response = client.models.generate_content(
            model=model,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
    except Exception as e:
        print(f"  ❌ APIエラー: {prompt_data['id']}: {e}")
        return "error"

    # 画像パーツを抽出
    image_saved = False
    for candidate in response.candidates or []:
        if candidate.content is None or candidate.content.parts is None:
            continue
        for part in candidate.content.parts:
            if part.inline_data is not None and part.inline_data.data:
                img = Image.open(BytesIO(part.inline_data.data))
                # RGB変換（JPEG保存のため）
                if img.mode != "RGB":
                    img = img.convert("RGB")
                img.save(out_path, "JPEG", quality=92)
                print(f"     ✅ 保存: {out_path.relative_to(REPO_ROOT)} ({img.size[0]}x{img.size[1]})")
                image_saved = True
                break
        if image_saved:
            break

    if not image_saved:
        print(f"  ⚠️ 画像パーツが返却されませんでした: {prompt_data['id']}")
        # レスポンスの text 部分もログ
        for candidate in response.candidates or []:
            if candidate.content is None:
                continue
            for part in candidate.content.parts or []:
                if part.text:
                    print(f"     テキスト応答: {part.text[:200]}")
        return "no_image"

    return "generated"


def main():
    parser = argparse.ArgumentParser(description="Gold Home HP画像自動生成")
    parser.add_argument("--test", metavar="ID", help="1枚だけテスト生成（ID指定）")
    parser.add_argument("--id", metavar="ID", help="特定IDだけ再生成（強制上書き）")
    parser.add_argument("--all", action="store_true", help="全18枚を生成")
    parser.add_argument("--missing", action="store_true", help="未生成のもののみ")
    parser.add_argument("--force", action="store_true", help="既存を上書き")
    parser.add_argument("--delay", type=float, default=3.0, help="生成間の待機秒数")
    args = parser.parse_args()

    if not any([args.test, args.id, args.all, args.missing]):
        parser.print_help()
        sys.exit(0)

    api_key, model = load_config()
    print(f"🔑 APIキー: 読込OK（{len(api_key)}文字）")
    print(f"🤖 モデル: {model}")

    with open(PROMPTS_FILE, encoding="utf-8") as f:
        prompts = json.load(f)
    print(f"📋 プロンプト: {len(prompts)}件 読込")

    client = genai.Client(api_key=api_key)

    targets = []
    if args.test:
        targets = [p for p in prompts if p["id"] == args.test]
    elif args.id:
        targets = [p for p in prompts if p["id"] == args.id]
        args.force = True
    elif args.all:
        targets = prompts
    elif args.missing:
        targets = [p for p in prompts if not (REPO_ROOT / p["output"]).exists()]

    if not targets:
        print("⚠️ 対象が見つかりません")
        sys.exit(1)

    print(f"\n=== 対象: {len(targets)}枚 ===\n")

    stats = {"generated": 0, "skipped": 0, "error": 0, "no_image": 0}
    for i, p in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}]")
        result = generate_one(client, model, p, force=args.force)
        stats[result] += 1
        if i < len(targets):
            time.sleep(args.delay)

    print(f"\n=== 完了 ===")
    print(f"  ✅ 生成成功: {stats['generated']}")
    print(f"  ⏭  スキップ: {stats['skipped']}")
    print(f"  ⚠️ 画像なし: {stats['no_image']}")
    print(f"  ❌ エラー:   {stats['error']}")


if __name__ == "__main__":
    main()
