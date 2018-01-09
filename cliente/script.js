
$(document).ready(function () {

    // Load summary
    $.get("../", response => {
        var html = '';
        response.forEach(row => {
            html += `<tr><td>${row.type}</td><td>${row.num}</td></tr>`;
        });
        $('#summary tbody').html(html);
    });

    // Add new
    $('#add').on('click', function () {
        $('#obj_type').val('AUTO');
        $('#obj_data').val('');
        $('main').attr('hidden', '');
        $('#edit').removeAttr('hidden')
    });

    $('#summary tbody').on('click', 'tr', function () {
        var type = $(this).find('td:first').text();

        // Load entity summary
        $.get("../" + type, response => {
            var html = '';
            response.forEach(row => {
                html += `<tr><td>${row.id}</td><td>${row.size}</td></tr>`;
            });
            $('#entity tbody').html(html);
        });

        $('main').attr('hidden', '');
        $('#entity').removeAttr('hidden')
    });


})


