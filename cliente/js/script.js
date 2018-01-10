// David González García
$(document).ready(function () {

    var type = '';
    var id = 0;
    var editor = new CodeFlask();
    editor.run('#obj_data', { language: 'json', rtl: false });
    $('#obj_data textarea').addClass('form-control');

    // Load summary
    $.get("../", function (response) {
        var html = '';
        response.forEach(function (row) {
            html += `<tr><td>${row.type}</td><td>${row.num}</td></tr>`;
        });
        $('#summary tbody').html(html);
    });

    // Add new
    $('#add, #add2').on('click', function () {
        id = 0;
        editor.update('{\n    "@context": "http://schema.org",\n    "@type": "' + type + '",\n}');
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

        $.ajax({
            url: "../" + type,
            type: 'POST',
            dataType: "json",
            data: obj,
            success: function (result) {
                if (!result || result.error) {
                    if (Array.isArray(result.error)) {
                        var htmlErr = '<ul><li>' + result.error.join('</li><li>') + '</li></ul>';
                    } else {
                        var htmlErr = '' + result.error;
                    }
                    showError(htmlErr);
                    return;
                }
                showSuccess('El objeto se guardó correctamente.');
                showEntitySumary(type);
            }
        });
    });

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
     * Muestras la sección indicadaa
     * @param string('summary' | 'entity' | 'object') page
     */
    function showPage(page) {
        $('main').attr('hidden', '');
        $('#'+page).removeAttr('hidden');
    }

    function showEntitySumary(newtype) {
        type = newtype;
        var actions = `<button type="button" class="btn btn-outline-primary btn-sm action-view">Ver</button>
                        <button type="button" class="btn btn-outline-success btn-sm action-edit">Modificar</button>
                        <button type="button" class="btn btn-outline-danger  btn-sm action-remove">Eliminar</button>`;

        // Load entity summary
        $.get("../" + type, function (response) {
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
        $.get("../" + type + '/' + id, function (response) {
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

        if (confirm("Seguro?")) {
            $.ajax({
                url: "../" + type + '/' + objId,
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

