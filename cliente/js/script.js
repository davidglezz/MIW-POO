// David González García
$(document).ready(function () {

  var servers = {
    'PHP': 8001,
    'NodeJs': 8002,
    'Python': 8003,
  }
  var api = (function () {
      var saved = localStorage.getItem('api')
      if (!saved) {
        return '//' + location.hostname + ':8002/'
      }
      $('#server-select .dropdown-toggle').text(saved)
      return '//' + location.hostname + ':' + servers[saved] + '/'
    })()
  var type = '';
  var id = 0;
  var editor = new CodeFlask();
  editor.run('#obj_data', { language: 'json', rtl: false });
  $('#obj_data textarea').addClass('form-control');

  // Load summary
  showSumary()

  // Backend server select
  $('#server-select .dropdown-item').on('click', function () {
    var selected = $(this).text()
    api = '//' + location.hostname + ':' + servers[selected] + '/'
    showSumary()
    $('#server-select .dropdown-toggle').text(selected)
    showPage('summary')
    localStorage.setItem('api', selected);
  })

  // Add new
  $('#add, #add2').on('click', function () {
    id = 0;
    editor.update('{\n  "@context": "http://schema.org",\n  "@type": "' + type + '",\n}');
    $('#obj_data textarea').removeAttr('readonly');
    $('#object .show-on-new').show();
    $('#object .name').html('');
    $('#edit').hide();
    $('#remove').hide();
    $('#save').show();
    showPage('object');
  });

  // View object list of type..
  $('#summary tbody').on('click', 'tr', function () {
    showEntitySumary($(this).find('td:first').text());
  });

  // "View object" button from table
  $('#entity tbody').on('click', '.action-view', function () {   
    loadObject($(this).closest('tr').find('td:first').text(), function () {
      $('#obj_data textarea').attr('readonly', 'readonly');
    });

    $('#object .show-on-new').hide();
    $('#object .name').html(id);

    $('#edit').show();
    $('#remove').show();
    $('#save').hide();

    showPage('object');
  });

  // "Edit object" button from table
  $('#entity tbody').on('click', '.action-edit', function () {
    loadObject($(this).closest('tr').find('td:first').text(), function () {
      $('#obj_data textarea').removeAttr('readonly');
    });

    $('#edit').hide();
    $('#remove').show();
    $('#save').show();

    $('#object .name').html(type);
    showPage('object');
  });

  // "Remove object" button from table
  $('#entity tbody').on('click', '.action-remove', function () {
    var $tr = $(this).closest('tr');
    removeObject($tr.find('td:first').text(), function (success) {
      if (success) {
        $tr.children('td')
          .animate({ padding: 0 })
          .wrapInner('<div />')
          .children()
          .slideUp(function () {
            $tr.remove();
          });
      } else {
        showError('Error al eliminar el objeto.');
      }
    })
  });

  // Botón guardar
  $('#save').on('click', function () {
    // Validar json y extraer tipo
    try {
      var obj = JSON.parse($('#obj_data textarea').val());
      if (obj && obj['@type']) {
        type = obj['@type'];
      } else {
        showError('No se ha proporcionado el tipo de la entidad.');
        return;
      }
    } catch (e) {
      showError(e);
      return;
    }

    let reqUrl
    let reqMethod
    if (id > 0) {
      reqUrl = api + type + '/' + id + '?_=' + Date.now()
      reqMethod = 'PUT'
    } else {
      reqUrl = api + type + '?_=' + Date.now()
      reqMethod = 'POST'
    }

    $.ajax({
      url: reqUrl,
      method: reqMethod,
      contentType: 'application/json; charset=utf-8',
      dataType: "json",
      cache : false,
      data: JSON.stringify(obj),
      success: function (result) {
        if (!result || result.error) {
          showError(Array.isArray(result.error) ? errorList(result.error) : ('' + result.error));
          return;
        }
        showSuccess('El objeto se guardó correctamente.');
        showEntitySumary(type);
      }
    });
  });

  function errorList(errors) {
    function list(err) {
      let html = '<ul>';
      for (let e of err) {
        html += '<li>' + (typeof e === 'string' ? e : list(e)) + '</li>'
      }
      return html + '</ul>'
    }
    return list(errors).replace('</li><li><ul>', '<ul>')
  }

  $('#remove').on('click', function () {
    removeObject(id, function (success) {
      if (success) {
        showSuccess('El objeto se eliminó correctamente.');
        showEntitySumary(type);
      } else {
        showError('Error al eliminar el objeto.');
      }
    })    
  })

  $('#edit').on('click', function () {
    $('#obj_data textarea').removeAttr('readonly');
    $('#edit').hide();
    $('#remove').show();
    $('#save').show();
  })

  // Botón atras
  $('#back2summary').on('click', function () {
    type = '';
    showPage('summary');
  });

  // Botón atras
  $('#back2entity').on('click', function () {
    showPage(type ? 'entity' : 'summary');
  });

  // Algunas funciones para no repetir código
  function showError(msg) {
    $('#tpl .alert-danger .msg').html(msg);
    $('#tpl .alert-danger').clone().removeAttr('hidden').appendTo('#alerts');
  }

  function showSuccess(msg) {
    $('#tpl .alert-success .msg').html(msg);
    $('#tpl .alert-success').clone().removeAttr('hidden').appendTo('#alerts');
  }

  /**
   * Muestra la sección indicada
   * @param string('summary' | 'entity' | 'object') page
   */
  function showPage(page) {
    $('main').attr('hidden', '');
    $('#'+page).removeAttr('hidden');
  }

  function showSumary() {
    $.get(api, function (response) {
      var html = '';
      if (response.forEach && response.length) {
        response.forEach(function (row) {
          html += `<tr><td>${row.type}</td><td>${row.num}</td></tr>`;
        });
      } else {
        html += `<tr><td colspan="2" class="text-muted">Sin resultados</td></tr>`;
      }
      $('#summary tbody').html(html);
    });
  }

  function showEntitySumary(newtype) {
    type = newtype;
    var actions = `<button type="button" class="btn btn-outline-primary btn-sm action-view">Ver</button>
            <button type="button" class="btn btn-outline-success btn-sm action-edit">Modificar</button>
            <button type="button" class="btn btn-outline-danger btn-sm action-remove">Eliminar</button>`;

    // Load entity summary
    $.get(api + type, function (response) {
      var html = '';
      response.forEach(function (row) {
        html += `<tr><td>${row.id}</td><td>${row.size}</td><td>${actions}</td></tr>`;
      });
      $('#entity tbody').html(html);
    });

    $('#entity .name').html(type);
    showPage('entity');
  }

  function loadObject(objId, callback) {
    // Load object data to editor
    id = objId;
    $.get(api + type + '/' + id, function (response) {
      if (response && response.data) {
        try {
          editor.update(JSON.stringify(JSON.parse(response.data), null, 4));
        } catch (e) {
          editor.update(response.data);
          showError('JSON mal formado: ' + e);
        }
      } else {
        showError('No se ha podido cargar.');
      }
      if (typeof callback === 'function') {
        callback();
      }
    });
  }

  function removeObject(objId, callback) {
    id = 0;

    var passwd = prompt('Seguridad: Introduzca la contraseña:    (1234)', '');
    if (passwd != null) {
      $.ajax({
        url: api + type + '/' + objId + '?passwd=' + passwd,
        type: 'DELETE',
        success: function (result) {
          if (typeof callback === 'function') {
            callback(result && result.success);
          }
        }
      });
    }
  }
  
})


