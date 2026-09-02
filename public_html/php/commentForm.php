<?php
// Input validation aur sanitization
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Check if fields exist and are not empty
    if (isset($_POST["name"]) && isset($_POST["email"]) && isset($_POST["message"])) {
        
        $name    = trim(htmlspecialchars($_POST["name"]));
        $email   = trim(htmlspecialchars($_POST["email"]));
        $message = trim(htmlspecialchars($_POST["message"]));
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo 'invalid_email';
            exit;
        }
        
        // Check if fields are not empty
        if (empty($name) || empty($email) || empty($message)) {
            echo 'empty_fields';
            exit;
        }
        
        $to = "aftabpthn313@gmail.com"; // APNA EMAIL YAHAN DALE
        $email_subject = "$name sent you a message via Your Website";
        
        // Email body
        $email_body = "You have received a new message from your website contact form.\n\n";
        $email_body .= "Name: $name\n";
        $email_body .= "Email: $email\n\n";
        $email_body .= "Message:\n$message\n";
        
        // Headers - CORRECTED
        $headers = "From: noreply@ssensesalon.com" . "\r\n";
        $headers .= "Reply-To: $email" . "\r\n";
        $headers .= "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type: text/plain; charset=UTF-8" . "\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();
        
        // Send email
        if (mail($to, $email_subject, $email_body, $headers)) {
            echo 'success';
        } else {
            echo 'failed';
        }
        
    } else {
        echo 'missing_fields';
    }
} else {
    echo 'invalid_request';
}
?>
