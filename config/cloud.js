import cloudinary from 'cloudinary'
import dotenv from 'dotenv'


dotenv.config()
console.log(process.env.CLOUD_APIKEY);

const cloudinry = cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_APIKEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const uploadImg = async (file) => {

  try {
    console.log('file---->', file);
    const uploadd = new Promise((resolve, reject) => {
      const fileName = `post_${file.originalname}_${Date.now()}`
      const streamm = cloudinary.v2.uploader.upload_stream({
        public_id: fileName,
        use_filename: true,
        resource_type: 'auto',
        folder: 'posts',
        overwrite: false,
        unique_filename: true

      }, (err, result) => {
        if (err) {
          console.log(err);
          return reject(err)

        }
        if (result) {
          console.log(result);
          return resolve(result)
        }

      })
      streamm.end(file.buffer)

    })
    console.log('upload.secure_url', uploadd.secure_url);
    return uploadd
  } catch (error) {
    console.log('error in uploading img--->', error);

  }
}

const deleteImg = async (public_id) => {
  try {
    if (!public_id) return null;

    const result = await cloudinary.v2.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.log('error in deleting img from cloudinary--->', error);
  }
};

export { uploadImg, deleteImg };