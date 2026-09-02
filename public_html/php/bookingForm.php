<?php
// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo 'failed';
    exit;
}

// Safely get and sanitize form data
$firstname = trim(filter_input(INPUT_POST, 'firstname', FILTER_SANITIZE_SPECIAL_CHARS));
$lastname = trim(filter_input(INPUT_POST, 'lastname', FILTER_SANITIZE_SPECIAL_CHARS));
$email = trim(filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL));
$phone = trim(filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_SPECIAL_CHARS));
$service = trim(filter_input(INPUT_POST, 'service', FILTER_SANITIZE_SPECIAL_CHARS));
$staff = trim(filter_input(INPUT_POST, 'staff', FILTER_SANITIZE_SPECIAL_CHARS));
$date = trim(filter_input(INPUT_POST, 'date', FILTER_SANITIZE_SPECIAL_CHARS));

$to = "aftabpthn313@gmail.com"; // Your email address

// Validate required fields and email format
if (empty($firstname) || empty($lastname) || empty($email) || empty($phone) || 
    empty($service) || empty($staff) || empty($date) || 
    !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    
    http_response_code(400); // Bad Request
    echo 'failed';
    exit;
}

// Sanitize data for email headers to prevent injection
$clean_firstname = preg_replace('/[\r\n]/', '', $firstname);
$clean_lastname = preg_replace('/[\r\n]/', '', $lastname);
$clean_email = filter_var($email, FILTER_SANITIZE_EMAIL);

// Email subject
$email_subject = "New Appointment Booking from $clean_firstname $clean_lastname";

// Build proper email headers
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type: text/plain; charset=UTF-8" . "\r\n";
$headers .= "From: $clean_firstname $clean_lastname <$clean_email>" . "\r\n";
$headers .= "Reply-To: $clean_email" . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Email message
$msg = "New appointment booking details:\n\n";
$msg .= "First Name: $firstname\n";
$msg .= "Last Name: $lastname\n";
$msg .= "Email: $email\n";
$msg .= "Phone Number: $phone\n\n";
$msg .= "Requested Service: $service\n";
$msg .= "Requested Staff: $staff\n";
$msg .= "Appointment Date: $date\n\n";
$msg .= "Please contact the customer to confirm the appointment.";

// Send email
if (mail($to, $email_subject, $msg, $headers)) {
    echo 'success';
} else {
    http_response_code(500); // Internal Server Error
    echo 'failed';
}
?>