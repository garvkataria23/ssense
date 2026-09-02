<?

$name  = $_REQUEST["name"];
$email = $_REQUEST["email"];
$subject = $_REQUEST["subject"];
$message   = $_REQUEST["message"];
$to    = "aftabpthn313@gmail.com"; // ENTER YOUR EMAIL ADDRESS
if (isset($email) && isset($name) && isset($message)) {
    $email_subject = "$name sent you a message via YOUR SITE NAME"; // ENTER YOUR EMAIL SUBJECT
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type:text/plain; charset=UTF-8" . "\r\n";
	$headers = 'From: ' . $name ."\r\n" .
        'Reply-To: ' . $email . "\r\n" .
        'X-Mailer: PHP/' . phpversion();
	$message     = "
	From: $name,
	Email: $email,
	Subject: $subject,
	Message: $message";
	
    $mail =  mail($to, $email_subject, $message, $headers);

if($mail)
	{
		echo 'success';
	}

else
	{
		echo 'failed';
	}
}

?>