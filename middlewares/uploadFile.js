const multer = require ('multer');

//setup config
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads');//lokasi file storage gambar
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname);//rename file tambah data millisecond
    },
});

//implementasi config
const upload = multer({
    storage: storage
})

module.exports = upload