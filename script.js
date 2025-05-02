$(document).ready(function () {
  const uploadCard = $('#uploadCard');
  const uploadInput = $('#uploadInput');
  const uploadButton = $('#uploadButton');
  const imagePreview = $('#imagePreview');
  const previewImage = $('#previewImage');
  const removeBtn = $('#removeBtn'); // "Remove Background" button
  const output = $('#output'); // Output image element
  const downloadLink = $('#downloadLink'); // Download link
  const outputTitle = $('#outputTitle'); // Output title

  imagePreview.hide();
  previewImage.hide();
  downloadLink.hide();
  outputTitle.hide();
  removeBtn.hide();
  output.hide();  
  
  // Image Upload Button Logic
  uploadButton.on('click', function () {
      uploadInput.click();
  });

  uploadCard.on('dragover', function (e) {
      e.preventDefault();
      $(this).css('border-color', '#3f51b5');
  });

  uploadCard.on('dragleave', function () {
      $(this).css('border-color', '#ccc');
  });

  uploadCard.on('drop', function (e) {
      e.preventDefault();
      $(this).css('border-color', '#ccc');
      const file = e.originalEvent.dataTransfer.files[0];
      handleImageUpload(file);
  });

  uploadInput.on('change', function () {
      const file = this.files[0];
      handleImageUpload(file);
  });

  function handleImageUpload(file) {
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = function (e) {
              previewImage.show();
              previewImage.attr('src', e.target.result).show();
              removeBtn.show(); // Show the "Remove Background" button after preview
          };
          reader.readAsDataURL(file);
      } else if (file) {
          alert('Please upload a valid image file.');
          uploadInput.val(''); // Clear the input
          previewImage.hide();
          removeBtn.hide();
      }
  }

  // Background Removal Logic (sending to FastAPI backend)
  removeBtn.on('click', function () {
      const file = uploadInput[0].files[0];
      if (!file) {
          alert('Please upload an image first.');
          return;
      }
      processImage(file);
  });

  function processImage(file) {
      const formData = new FormData();
      formData.append('file', file);

      const backendUrl = 'http://127.0.0.1:8000/remove-bg/';  // Your FastAPI endpoint

      // Show processing state
      removeBtn.text('Processing...').prop('disabled', true);
      previewImage.hide();
      output.hide();
      outputTitle.hide();
      downloadLink.hide();

      $.ajax({
          url: backendUrl,
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function(res) {
              if (res.base64_img) {
                  // Convert base64 response to image source
                  let imageSource = "data:image/png;base64," + res.base64_img;
                  output.attr("src", imageSource);
                  output.show();
                  outputTitle.show();
                  downloadLink.show();
                  downloadLink.attr("href", imageSource);
                  downloadLink.attr("download", "output.png");

              }
              removeBtn.text('Remove Background').prop('disabled', false); // Reset button text
          },
          error: function(err){
              console.log(err);
              alert("Upload failed.");
              removeBtn.text('Remove Background').prop('disabled', false); // Reset button text
          }
      });
  }
});
