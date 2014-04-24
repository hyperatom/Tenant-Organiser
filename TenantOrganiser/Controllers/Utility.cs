using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace TenantOrganiser.Controllers
{
    public class Utility
    {
        public static System.Drawing.Image DownloadImageFromUrl(string imageUrl)
        {
            System.Drawing.Image image = null;

            try
            {
                System.Net.HttpWebRequest webRequest = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(imageUrl);
                webRequest.AllowWriteStreamBuffering = true;
                webRequest.Timeout = 30000;

                System.Net.WebResponse webResponse = webRequest.GetResponse();

                System.IO.Stream stream = webResponse.GetResponseStream();

                image = System.Drawing.Image.FromStream(stream);

                webResponse.Close();
            }
            catch (Exception ex)
            {
                return null;
            }

            return image;
        }

        public static string EmailToMd5Hash(string email)
        {
            MD5 hash = MD5.Create();
            byte[] usernameHash = hash.ComputeHash(Encoding.UTF8.GetBytes(email));

            StringBuilder sb = new StringBuilder();

            for (int i = 0; i < usernameHash.Length; i++)
            {
                sb.Append(usernameHash[i].ToString());
            }

            return sb.ToString();
        }

        public static Image ResizeImage(Image imgToResize, Size size)
        {
            return (Image)(new Bitmap(imgToResize, size));
        }

        public static Image CropImage(Image img)
        {
            Bitmap bmpImage = new Bitmap(img);
            var width = img.Width;
            var height = img.Height;

            if (width > height)
            {
                var leftRightCrop = (width - height) / 2;
                return bmpImage.Clone(new Rectangle(0, 0, height, height), bmpImage.PixelFormat);
            }
            else if (height > width)
            {
                var topBottomCrop = (height - width) / 2;
                return bmpImage.Clone(new Rectangle(0, 0, width, width), bmpImage.PixelFormat);
            }

            return bmpImage;
        }
    }
}