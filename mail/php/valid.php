<?php

if (
    (isset($_POST['name']) && !empty($_POST['name'])) ||
    (isset($_POST['tel']) && !empty($_POST['tel'])) ||
    (isset($_POST['email']) && !empty($_POST['email'])) ||
    (isset($_POST['companyName']) && !empty($_POST['companyName'])) ||
    (isset($_POST['objectName']) && !empty($_POST['objectName']))

){
    $name = "<b>Имя: </b>" . trim(strip_tags($_POST['name'])) . "<br>";
    $tel = "<b>Телефон: </b> " . trim(strip_tags($_POST['tel'])) . "<br>";
    $email = "<b>Почта: </b> " . trim(strip_tags($_POST['email'])) . "<br>";
    $companyName = "<b>Название компании: </b> " . trim(strip_tags($_POST['companyName'])) . "<br>";
    $objectName = "<b>Название объекта: </b> " . trim(strip_tags($_POST['objectName'])) . "<br><br>Сотрудник ЭнергоПро обязан отправить Заказчику ТКП с ценой минимум на 5% дешевле.";

} else {
    echo "Заполните корректно все поля";
    die;
}