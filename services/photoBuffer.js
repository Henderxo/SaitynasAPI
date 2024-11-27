const getMimeType = (buffer) => {
    const header = buffer.toString('hex', 0, 4); // Get the first 4 bytes of the buffer as a hex string
  
    switch (header) {
      case '89504e47': // PNG
        return 'image/png';
      case 'ffd8ffe0': // JPEG
      case 'ffd8ffe1': // JPEG
      case 'ffd8ffe2': // JPEG
        return 'image/jpeg';
      case '47494638': // GIF
        return 'image/gif';
      default:
        return 'application/octet-stream'; // Unknown binary data
    }
  };
  
  module.exports = { getMimeType };