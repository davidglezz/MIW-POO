
$(document).ready(function () {
    
    // Load summary
    $.get("../", function (response) {
        var html = '';
        response.forEach(function (row) {
            html += `<tr><td>${row.type}</td><td>${row.num}</td></tr>`;
        });
        $('#obj_type').html(html);
    });

    // Load entities types
    $.get("../", function (response) {
        var html = '<option value="AUTO" selected>Automatic</option>';
        response.forEach(function (row) {
            html += `<option value="1">One</option>${row.type}`;
        });
        $('#summary tbody').html(html);
    });


    // Add new
    $('#add, #add2').on('click', function () {
        $('#obj_type').val('AUTO');
        $('#obj_data').html('{\n    "@context": "http://schema.org",\n    "@type": "",\n}');

        var flask = new CodeFlask();
        flask.run('#obj_data', { language: 'json', rtl: false });
        //flask.update("{\n    "@context": "http://schema.org",\n    "@type": "",\n}");

        $('#obj_data textarea').addClass('form-control');
        $('#edit').hide();
        $('#remove').hide();

        $('main').attr('hidden', '');
        $('#object').removeAttr('hidden');
    });

    // View object list of type..
    var type = null;
    $('#summary tbody').on('click', 'tr', function () {
        type = $(this).find('td:first').text();

        var actions = `<button type="button" class="btn btn-outline-primary btn-sm action-view">Ver</button>
                        <button type="button" class="btn btn-outline-success btn-sm action-edit">Modificar</button>
                        <button type="button" class="btn btn-outline-danger  btn-sm action-remove">Eliminar</button>`;

        // Load entity summary
        $.get("../" + type, response => {
            var html = '';
            response.forEach(row => {
                html += `<tr><td>${row.id}</td><td>${row.size}</td><td>${actions}</td></tr>`;
            });
            $('#entity tbody').html(html);
        });

        $('#entity .name').html(type);
        $('main').attr('hidden', '');
        $('#entity').removeAttr('hidden');
    });

    // View object
    $('#entity tbody').on('click', '.action-view', function () {
        var id = $(this).closest('tr').find('td:first').text();
        // Load object data
        $.get("../" + type + '/' + id, response => {
            $('#obj_type').val(type);
            $('#obj_id').val(id);
            $('#obj_data').val(response.data);
        });

        $('#object .name').html(type);
        $('#obj_type, #obj_data').attr('readonly', 'readonly');
        $('main').attr('hidden', '');
        $('#object').removeAttr('hidden');
    });

    // Edit object
    $('#entity tbody').on('click', '.action-edit', function () {
        var id = $(this).closest('tr').find('td:first').text();
        // Load object data
        $.get("../" + type + '/' + id, response => {
            $('#obj_type').val(type);
            $('#obj_id').val(id);
            $('#obj_data').val(response.data);
        });

        $('#object .name').html(type);
        $('#obj_type, #obj_data').removeAttr('readonly');
        $('main').attr('hidden', '');
        $('#object').removeAttr('hidden');
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
                        .animate({padding: 0})
                        .wrapInner('<div />')
                        .children()
                        .slideUp(function () {
                            $tr.remove();
                        });
                }
            });
        }
    });

    // Botón atras
    $('#back2summary').on('click', function () {
        $('main').attr('hidden', '');
        $('#summary').removeAttr('hidden');
    });

    // Botón atras
    $('#back2entity').on('click', function () {
        $('main').attr('hidden', '');
        $('#entity').removeAttr('hidden');
    });

    
})


