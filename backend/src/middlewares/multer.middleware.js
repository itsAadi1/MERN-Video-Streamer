import multer from "multer";
const storage = multer.diskStorage({
  // Log when the destination is set
  destination: function (req, file, cb) {
      console.log("In destination function");
      console.log("File:", file);  // Log the file object to see its properties
      console.log("Destination Path: ./public/temp");
      cb(null, "./public/temp");
  },
  // Log when the filename is set
  filename: function (req, file, cb) {
      console.log("In filename function");
      console.log("Original filename:", file.originalname);
      cb(null, file.originalname);
  }
});

export const upload = multer({ 
    storage, 
})