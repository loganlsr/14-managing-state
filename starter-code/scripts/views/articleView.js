(function(module) {

  var articleView = {};

  var render = function(article) {
    var template = Handlebars.compile($('#article-template').text());

    article.daysAgo = parseInt((new Date() - new Date(article.publishedOn))/60/60/24/1000);
    article.publishStatus = article.publishedOn ? 'published ' + article.daysAgo + ' days ago' : '(draft)';
    article.body = marked(article.body);

    return template(article);
  };

  // COMMENT: DONE What does this method do?  What is it's execution path?
  //This method declares two variables: options is empty and template is a compiled handlebars template(which is a function).
  //From there options is populated by Article.allAuthors, which will return an array of the authors in the Articles.all array, then a map is applied to it that compiles the authors into the handlebars template.  That data is then appended to the DOM if it meets the condidtions of the if statement (the length of what's there is less than 2 authors).  The Article.alLCategories method is different, it makes a call directly to the database instead of scraping the displayed page.  It also appends to the DOM if the previous length is less than 2.
  articleView.populateFilters = function() {
    var options, template = Handlebars.compile($('#option-template').text());
    options = Article.allAuthors().map(function(author) { return template({val: author}); });
    if ($('#author-filter option').length < 2) { // Prevent duplication
      $('#author-filter').append(options);
    };
    // Example of using model method with functional programming, synchronous approach:
    // This method is dependant on info being in the DOM. Only authors of shown articles are loaded.

    // Example of using model method with async, SQL-based approach:
    // This approach is DOM-independent, since it reads from the DB directly.
    Article.allCategories(function(rows) {
      if ($('#category-filter option').length < 2) {
        $('#category-filter').append(
          rows.map(function(row) {
            return template({val: row.category});
          })
        );
      };
    });
  };

  // COMMENT: DONE What does this method do?  What is it's execution path?
  //This function attaches an event handler to the #filters element that will execute at most once per element per event type.  It's going to concat the filter ID and send us to the URI for what was clicked on, for example the category-filter was boats, it's going to now have the category in resource, and boats as this.val() so the URI would be /category/boats.
  articleView.handleFilters = function() {
    $('#filters').one('change', 'select', function() {
      var resource = this.id.replace('-filter', '');
      page('/' + resource + '/' + $(this).val().replace(/\W+/g, '+')); // Replace any/all whitespace with a +
    });
  };
  // articleView.handleAuthorFilter = function() {
  //   $('#author-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-author="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#category-filter').val('');
  //   });
  // };
  //
  // articleView.handleCategoryFilter = function() {
  //   $('#category-filter').on('change', function() {
  //     if ($(this).val()) {
  //       $('article').hide();
  //       $('article[data-category="' + $(this).val() + '"]').fadeIn();
  //     } else {
  //       $('article').fadeIn();
  //       $('article.template').hide();
  //     }
  //     $('#author-filter').val('');
  //   });
  // };

  // DONE: Remove the setTeasers method, and replace with a plain ole link in the article template.
  // articleView.setTeasers = function() {
  //   $('.article-body *:nth-of-type(n+2)').hide();
  //
  //   $('#articles').on('click', 'a.read-on', function(e) {
  //     e.preventDefault();
  //     $(this).parent().find('*').fadeIn();
  //     $(this).hide();
  //   });
  // };

  articleView.initNewArticlePage = function() {
    $('#articles').show().siblings().hide();

    $('#export-field').hide();
    $('#article-json').on('focus', function(){
      this.select();
    });

    $('#new-form').on('change', 'input, textarea', articleView.create);
  };

  articleView.create = function() {
    var formArticle;
    $('#articles').empty();

    // Instantiate an article based on what's in the form fields:
    formArticle = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? new Date() : null
    });

    $('#articles').append(render(formArticle));

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // Export the new article as JSON, so it's ready to copy/paste into blogArticles.js:
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(article) + ',');
  };

  // COMMENT: What does this method do?  What is it's execution path?
  // The first part of this method shows all of the #articles element while hiding its siblings.
  // The next part removes the content of the #articles element.
  // Then from the articles array it appends the articles back to the DOM.
  // Then it populates both the filters.
  // Finally it sets the teasers.
  articleView.index = function(articles) {
    $('#articles').show().siblings().hide();

    $('#articles article').remove();
    articles.forEach(function(a) {
      $('#articles').append(render(a));
    });

    articleView.populateFilters();
    articleView.handleFilters();

    // DONE: Replace setTeasers with just the truncation logic, if needed:
    if ($('#articles article').length > 1) {
      $('.article-body *:nth-of-type(n+2)').hide();
    }
  };

  articleView.initAdminPage = function() {
    var template = Handlebars.compile($('#author-template').text());

    Article.numWordsByAuthor().forEach(function(stat) {
      $('.author-stats').append(template(stat));
    });

    $('#blog-stats .articles').text(Article.all.length);
    $('#blog-stats .words').text(Article.numWordsAll());
  };

  module.articleView = articleView;
})(window);
