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

        $('#edit').hide();
        $('#remove').hide();

        showPage('object');
    });

    // View object list of type..
    $('#summary tbody').on('click', 'tr', function () {
        showEntitySumary($(this).find('td:first').text());
    });

    // View object
    $('#entity tbody').on('click', '.action-view', function () {
        var id = $(this).closest('tr').find('td:first').text();
        // Load object data
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
        });

        $('#object .name').html(type);
        $('#obj_data textarea').attr('readonly', 'readonly');
        showPage('object');
    });

    // Edit object
    $('#entity tbody').on('click', '.action-edit', function () {
        id = $(this).closest('tr').find('td:first').text();
        // Load object data
        $.get("../" + type + '/' + id, function (response) {
            $('#obj_data').val(response.data);
        });

        $('#object .name').html(type);
        $('#obj_data').removeAttr('readonly');
        showPage('object');
    });

    // Remove object
    $('#entity tbody').on('click', '.action-remove', function () {
        var $tr = $(this).closest('tr');
        var id = $tr.find('td:first').text();

        if (confirm("Seguro?")) {
            $.ajax({
                url: "../" + type + '/' + id,
                type: 'DELETE',
                success: function (result) {
                    $tr.children('td')
                        .animate({ padding: 0 })
                        .wrapInner('<div />')
                        .children()
                        .slideUp(function () {
                            $tr.remove();
                        });
                }
            });
        }
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
                console.log(result);
                if (!result || result.error) {
                    if (Array.isArray(result.error)) {
                        var htmlErr = '<ul><li>' + result.error.join('</li><li>') + '</li></ul>';
                    } else {
                        var htmlErr = '' + result.error;
                    }
                    
                    showError(htmlErr);
                    return;
                }

                $('#tpl .alert-success').clone().removeAttr('hidden').appendTo('#alerts');
                showEntitySumary(type);
            }
        });
    });

    // Botón atras
    $('#back2summary').on('click', function () {
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
    
})


