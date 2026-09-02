<?php
// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    // Get and sanitize email input
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    
    // Validate email
    if (empty($email)) {
        echo 'failed';
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo 'failed';
        exit;
    }
    
    // Email configuration
    $to = "aftabpthn313@gmail.com"; // Replace with your actual email
    $email_subject = "New Subscription Request - S.Sense Salon & Spa";
    
    // Email headers
    $headers = "From: noreply@ssensesalon.com\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Email message
    $msg = "New subscription request:\n\n";
    $msg .= "Email: " . $email . "\n";
    $msg .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $msg .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Send email
    $mail = mail($to, $email_subject, $msg, $headers);
    
    if ($mail) {
        echo 'success';
    } else {
        echo 'failed';
    }
} else {
    echo 'failed';
}
?>
