var socket;

$(document).ready(function(){

    $('#body').append('<div class=""><p>Upload</p><form action="" method="post" enctype="multipart/form-data"><input type="file" name="uploadfile"><input type="submit" name="submit" value="submit"></form></div>');

    var uploadStatus = $('#uploadStatus').html();
    var uploadFile = $('#uploadFile').html();
    if (uploadStatus) {
        var filesplit = uploadFile.split('.'), uploadFilePlayer;
        var filetype = filesplit[filesplit.length-1];
        filetype = filetype.toLowerCase();
        if (filetype == 'mp4') {
            uploadFilePlayer = '<video controls><source src="' + uploadFile + '" type=\'video/mp4; codecs="avc1.42E01E, mp4a.40.2"\' /></video>';
        } else if (filetype == 'png' || filetype == 'jpg') {
            uploadFilePlayer = '<img src="' + uploadFile + '" />';
        } else {
            uploadFilePlayer = '<a href="' + uploadFile + '">uploaded file</a>';
        }
        $('#body').append('<div class=""><h2>Upload</h2><p>' + uploadStatus + '</p><p>' + uploadFilePlayer + '</p></div>');
    }

});
