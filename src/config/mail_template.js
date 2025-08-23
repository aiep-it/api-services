const mailTemplate = (name, activateLink, loginLink) => `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kích Hoạt Tài Khoản Của Con Bạn</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            color: white;
            background-color: #007bff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Xin chào, ${name}!</h1>
        <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấn vào nút bên dưới để kích hoạt tài khoản của con bạn:</p>
        <a href="${activateLink}" class="button">Kích Hoạt Tài Khoản</a>
        <p>Và bạn có thể <a href="${loginLink}">đăng nhập tại đây</a>.</p>
        <p>Nếu bạn không tạo tài khoản, vui lòng bỏ qua email này.</p>
    </div>
</body>
</html>
`;

module.exports = mailTemplate;