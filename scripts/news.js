// microCMS お知らせ取得ユーティリティ
(function(){
  var CFG = {
    domain: 'goldhome.microcms.io',
    endpoint: 'news',
    apiKey: 'uxTIWPS5Uixbt62brCSQgRc7QnYHLsEgKTDf'
  };

  function escapeHtml(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function fmtDate(iso){
    if(!iso) return '';
    var d = new Date(iso);
    if(isNaN(d)) return '';
    return d.getFullYear() + '.' + (d.getMonth()+1) + '.' + d.getDate();
  }

  function fetchNews(params){
    var qs = '';
    if(params){
      var parts = [];
      for(var k in params){ if(params[k] != null) parts.push(encodeURIComponent(k)+'='+encodeURIComponent(params[k])); }
      if(parts.length) qs = '?' + parts.join('&');
    }
    var url = 'https://' + CFG.domain + '/api/v1/' + CFG.endpoint + qs;
    return fetch(url, { headers: { 'X-MICROCMS-API-KEY': CFG.apiKey } })
      .then(function(r){
        if(!r.ok) throw new Error('API error ' + r.status);
        return r.json();
      });
  }

  // トップページ用: 最新5件（日付＋題名のみ）
  function renderTopList(el){
    if(!el) return;
    fetchNews({ limit: 5, orders: '-date' })
      .then(function(res){
        if(!res.contents || !res.contents.length){
          el.innerHTML = '<li class="news-empty">お知らせはまだありません。</li>';
          return;
        }
        el.innerHTML = res.contents.map(function(c){
          return '<li class="news-row"><a href="news-detail.html?id=' + encodeURIComponent(c.id) + '">' +
                 '<time>' + escapeHtml(fmtDate(c.date || c.publishedAt)) + '</time>' +
                 '<span class="news-title">' + escapeHtml(c.title || '') + '</span>' +
                 '</a></li>';
        }).join('');
      })
      .catch(function(e){
        console.error(e);
        el.innerHTML = '<li class="news-empty">お知らせを取得できませんでした。</li>';
      });
  }

  // 一覧ページ用（news.html）: ?page=N でページング（1ページあたり9件）
  function renderFullList(el, pagerEl){
    if(!el) return;
    var PER_PAGE = 9;
    var page = Math.max(1, parseInt(new URLSearchParams(location.search).get('page') || '1', 10) || 1);
    var offset = (page - 1) * PER_PAGE;
    fetchNews({ limit: PER_PAGE, offset: offset, orders: '-date' })
      .then(function(res){
        var total = res.totalCount || 0;
        var pages = Math.max(1, Math.ceil(total / PER_PAGE));
        if(page > pages){
          location.replace('news.html?page=' + pages);
          return;
        }
        if(!res.contents || !res.contents.length){
          el.innerHTML = '<p class="news-empty">お知らせはまだありません。</p>';
          if(pagerEl) pagerEl.innerHTML = '';
          return;
        }
        el.innerHTML = res.contents.map(function(c){
          var img = c.image && c.image.url
            ? '<div class="news-thumb"><img src="' + escapeHtml(c.image.url) + '?w=320&h=200&fit=crop" alt=""></div>'
            : '';
          return '<article class="news-card"><a href="news-detail.html?id=' + encodeURIComponent(c.id) + '">' +
                 img +
                 '<div class="news-body">' +
                 '<time>' + escapeHtml(fmtDate(c.date || c.publishedAt)) + '</time>' +
                 '<h3>' + escapeHtml(c.title || '') + '</h3>' +
                 '</div></a></article>';
        }).join('');
        if(pagerEl) pagerEl.innerHTML = renderPager(page, pages);
      })
      .catch(function(e){
        console.error(e);
        el.innerHTML = '<p class="news-empty">お知らせを取得できませんでした。</p>';
        if(pagerEl) pagerEl.innerHTML = '';
      });
  }

  function renderPager(current, total){
    if(total <= 1) return '';
    var items = [];
    // 前へ
    if(current > 1){
      items.push('<a class="pg-nav" href="news.html?page=' + (current-1) + '" aria-label="前のページ">‹ 前へ</a>');
    } else {
      items.push('<span class="pg-nav pg-disabled">‹ 前へ</span>');
    }
    // ページ番号（前後2件±省略）
    var range = pageRange(current, total);
    range.forEach(function(p){
      if(p === '…'){
        items.push('<span class="pg-ellipsis">…</span>');
      } else if(p === current){
        items.push('<span class="pg-num pg-current" aria-current="page">' + p + '</span>');
      } else {
        items.push('<a class="pg-num" href="news.html?page=' + p + '">' + p + '</a>');
      }
    });
    // 次へ
    if(current < total){
      items.push('<a class="pg-nav" href="news.html?page=' + (current+1) + '" aria-label="次のページ">次へ ›</a>');
    } else {
      items.push('<span class="pg-nav pg-disabled">次へ ›</span>');
    }
    return items.join('');
  }

  function pageRange(current, total){
    var out = [];
    var window_ = 1;
    for(var p = 1; p <= total; p++){
      if(p === 1 || p === total || (p >= current - window_ && p <= current + window_)){
        out.push(p);
      } else if(out[out.length - 1] !== '…'){
        out.push('…');
      }
    }
    return out;
  }

  // 詳細ページ用（news-detail.html?id=xxx）
  function renderDetail(el){
    if(!el) return;
    var id = new URLSearchParams(location.search).get('id');
    if(!id){
      el.innerHTML = '<p class="news-empty">記事が指定されていません。<a href="news.html">お知らせ一覧へ</a></p>';
      return;
    }
    var url = 'https://' + CFG.domain + '/api/v1/' + CFG.endpoint + '/' + encodeURIComponent(id);
    fetch(url, { headers: { 'X-MICROCMS-API-KEY': CFG.apiKey } })
      .then(function(r){
        if(r.status === 404) throw new Error('not-found');
        if(!r.ok) throw new Error('API error ' + r.status);
        return r.json();
      })
      .then(function(c){
        document.title = (c.title || 'お知らせ') + '｜Gold Home株式会社';
        var img = c.image && c.image.url
          ? '<figure class="news-hero"><img src="' + escapeHtml(c.image.url) + '?w=1200" alt=""></figure>'
          : '';
        el.innerHTML =
          '<time class="news-date">' + escapeHtml(fmtDate(c.date || c.publishedAt)) + '</time>' +
          '<h1 class="news-h1">' + escapeHtml(c.title || '') + '</h1>' +
          img +
          '<div class="news-content">' + (c.body || '') + '</div>' +
          '<p class="news-back"><a href="news.html">← お知らせ一覧へ戻る</a></p>';
      })
      .catch(function(e){
        console.error(e);
        el.innerHTML = e.message === 'not-found'
          ? '<p class="news-empty">記事が見つかりませんでした。<a href="news.html">お知らせ一覧へ</a></p>'
          : '<p class="news-empty">お知らせを取得できませんでした。<a href="news.html">お知らせ一覧へ</a></p>';
      });
  }

  window.GoldHomeNews = {
    renderTopList: renderTopList,
    renderFullList: renderFullList,
    renderDetail: renderDetail
  };
})();
