<?php

mb_internal_encoding("UTF-8");
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;

if ($_SERVER["REQUEST_METHOD"] == "POST") :

    require_once($_SERVER['DOCUMENT_ROOT'] . '/mail/phpmailer/phpmailer.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/mail/php/config.php');
    require_once($_SERVER['DOCUMENT_ROOT'] . '/mail/php/valid.php');

    if (defined('HOST') && HOST != '') {
        $mail = new PHPMailer;
        $mail->isSMTP();
        $mail->Host = HOST;
        $mail->SMTPAuth = true;
        $mail->Username = LOGIN;
        $mail->Password = PASS;
        $mail->SMTPSecure = 'ssl';
        $mail->Port = PORT;
        $mail->AddReplyTo(SENDER);
    } else {
        $mail = new PHPMailer;
    }

    for ($ct = 0; $ct < count($_FILES['files']['tmp_name']); $ct++) {
        $uploadfile = tempnam(sys_get_temp_dir(), sha1($_FILES['files']['name'][$ct]));
        $filename = $_FILES['files']['name'][$ct];
        if (move_uploaded_file($_FILES['files']['tmp_name'][$ct], $uploadfile)) {
            $mail->addAttachment($uploadfile, $filename);
        } else {
            $msg .= 'failfile';
        }
    }

    $mail->setFrom(SENDER);
    $mail->addAddress(CATCHER);
    $mail->CharSet = CHARSET;
    $mail->isHTML(true);
    $mail->Subject = "ТКП: ". $_POST['name'] ." | ".$_POST['objectName']." | ". $_POST['companyName'];
    $mail->Body = "$name $tel $email $companyName $objectName";
    if (!$mail->send()) {
        $sendError = "при отправке сообщения возникли ошибки";
        die;
    } else {
        $soobchenie = "<p>Уважаемый " . $_POST['name'] . "!</p>";
        $soobchenie .= "<p>Ваш запрос успешно отправлен.</p>";
        $soobchenie .= "<p>В ближайшее время с Вами свяжется сотрудник компании ЭнергоПро.</p>";
        $soobchenie .= "<p>Вернуться на сайт EnergoPro: <a href='https://energopro.kz/index.php'>energopro.kz</a></p>";

    }
    ?>
    <!doctype html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
    </head>
    <body>
    <? if (isset($soobchenie)) : ?>
        <?= $soobchenie; ?>
    <? endif; ?>


    <? if (isset($sendError)) : ?>
        <?= $sendError; ?>
    <? endif; ?>
    </body>
    </html>

<? else:
    header("Location: /");
endif;
?>


