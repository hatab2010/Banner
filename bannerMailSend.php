<?php
$headers = "Content-type: text/html; charset=utf-8\r\n";
mail($_POST["Mail"], "Спасибо", $_POST["Data"], $headers);