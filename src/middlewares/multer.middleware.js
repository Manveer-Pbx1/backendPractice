import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp') // this is the folder where the file will be stored 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // this is the name the file will have (what the user orignally named it)
    }
  })
  
 export const upload = multer({ storage, })