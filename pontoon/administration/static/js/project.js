$(function() {

  // Before submitting the form
  $('form').submit(function (e) {
    // Update locales
    var arr = [];
    $("#selected").siblings('ul').find('li:not(".no-match")').each(function() {
      arr.push($(this).data('id'));
    });
    $('#id_locales').val(arr);

    // Append slash to the URL field
    var url = $('#id_url').val();
    if (url.length > 0 && url[url.length-1] !== '/') {
      $('#id_url').val(url + '/');
    }

    // Update form action
    var name = $('#id_name').val();
    if (name.length > 0) {
      name += '/';
    }
    $('form').attr('action', $('form').attr('action').split('/project/')[0] + '/project/' + name);
  });

  // Submit form with Enter
  $('html').unbind("keydown.pontoon").bind("keydown.pontoon", function (e) {
    if ($('input[type=text]:not(".search, #id_transifex_username, #id_transifex_password"):focus').length > 0) {
      var key = e.keyCode || e.which;
      if (key === 13) { // Enter
        // A short delay to allow digest of autocomplete before submit 
        setTimeout(function() {
          $('form').submit();
        }, 1);
        return false;
      }
    }
  });

  // Choose locales
  $('.locale.select li').live('click.pontoon', function (e) {
    var target = $(this).parents('.locale.select').siblings('.locale.select').find('ul'),
        clone = $(this).remove();
    target.prepend(clone);
  });

  // Choose/remove all locales
  $('.choose-all, .remove-all').live('click.pontoon', function (e) {
    e.preventDefault();
    var ls = $(this).parents('.locale.select'),
        target = ls.siblings('.locale.select').find('ul'),
        items = ls.find('li:visible:not(".no-match")').remove();
    target.prepend(items);
  });

  // Select repository type
  $('body').live("click.pontoon", function () {
    $('.repository .menu').hide();
    $('.select').removeClass('opened');
  });
  $('.repository .type li').live("click.pontoon", function () {
    var selected = $(this).html(),
        selected_lower = selected.toLowerCase();
    $(this).parents('.select').find('.title').html(selected);
    $('#id_repository_type').val(selected_lower);
    $('.details-wrapper').attr('data-repository-type', selected_lower);
  });
  // Show human-readable value
  $('.repository .type li[data-type=' + $('#id_repository_type').val() + ']').click();

  // Update from repository
  $('.repository .update:not(".disabled"), .transifex .update:not(".disabled")').unbind('click.pontoon').bind('click.pontoon', function (e) {
    e.preventDefault();
    $(this).addClass('disabled');
    var source = $(this).data('source'),
        img = $(this).find('img');

    function updateIcon(filename) {
      img.attr('src', '/static/img/' + filename);
    }
    updateIcon('loader-light.gif');

    params = {
      pk: $('input[name=pk]').val(),
      csrfmiddlewaretoken: $('#server').data('csrf')
    }
    if (source === 'repository') {
      params.repository_url = $('input[name=repository_url]').val();
      params.repository_type = $('select[name=repository_type]').val();
    } else if (source === 'transifex') {
      if ($(this).parents('.popup').length === 0) {
        project = $('.transifex input#id_transifex_project');
        resource = $('.transifex input#id_transifex_resource');
        params[project.attr('name')] = project.val();
        params[resource.attr('name')] = resource.val();
      } else {
        $('.transifex input').each(function() {
          var val = $(this).val();
          if (val) {
            if ($(this).attr('name') === 'remember') {
              params[$(this).attr('name')] = ($(this).is(':checked')) ? "on" : "off";
            } else {
              params[$(this).attr('name')] = val;
            }
          }
        });
      }
    }

    $.ajax({
      url: '/admin/' + source + '/',
      type: 'POST',
      data: params,
      success: function(data) {
        if (data === "200") {
          updateIcon('ok.png');
          $('.repository').removeClass('authenticate');
          $('.warning').fadeOut();
        } else if (data === "authenticate") {
          updateIcon('update.png');
          $('.repository').addClass('authenticate');
        } else if (data === "error"){
          updateIcon('error.png');
        }
      },
      error: function() {
        updateIcon('error.png');
      }
    }).complete(function() {
      img.parent().removeClass('disabled');
      setTimeout(function() {
        updateIcon('update.png');
      }, 5000);
    });
  });

  // Delete subpage
  $('.delete-subpage').live('click.pontoon', function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
    $(this).next().prop('checked', !$(this).next().prop('checked'));
  });
  $('.subpages [checked]').click().prev().click();

  // Add subpage
  var count = $('.subpages:last').data('count');
  $('.add-subpage').click(function(e) {
    e.preventDefault();
    var form = $('.subpages:last').html().replace(/__prefix__/g, count);
    $('.subpages:last').before('<div class="subpages clearfix">' + form + '</div>');
    count++;
    $('#id_subpage_set-TOTAL_FORMS').val(count);
  });

  // Delete project
  $('.delete-project').live('click.pontoon', function (e) {
    e.preventDefault();
    if ($(this).is('.clicked')) {
      window.location = '/admin/delete/' + $('input[name=pk]').val();
    } else {
      $(this).addClass('clicked').html('Are you sure?');
    }
  });

});
