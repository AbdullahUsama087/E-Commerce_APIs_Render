import qrCode from "qrcode";

const qrCodeFunction = ({ data = "" } = {}) => {
  const QR = qrCode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: "H",
  });
  return QR;
};

export default qrCodeFunction;
