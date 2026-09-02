// Enhanced JavaScript for Newsletter and Modal Forms
$(document).ready(function() {
    "use strict";
    
// Newsletter Form Handler
    $("#newsletter-form").on('submit', function(e) {
        e.preventDefault();
        console.log("Form submitted!");
        
        var email = $("#s-email");
        var notification = $("#newsletter-notification");
        var submitBtn = $("#newsletter-submit");
        
        console.log("Email field:", email);
        console.log("Email value:", email.val());
        console.log("Notification element:", notification);
        console.log("Submit button:", submitBtn);
        
        // Reset previous states
        email.removeClass("error success");
        notification.removeClass("error success loading").text("");
        
        // Get email value
        var emailValue = email.val().trim();
        console.log("Email value trimmed:", emailValue);
        
        // Basic validation
        if (emailValue === "") {
            console.log("Email is empty");
            showError(email, notification, 'Please enter your email address.');
            return false;
        }
        
        // Email format validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailValue)) {
            console.log("Invalid email format");
            showError(email, notification, 'Please enter a valid email address.');
            return false;
        }
        
        console.log("Email validation passed");
        
        // Show loading state
        submitBtn.prop('disabled', true);
        notification.removeClass("error success").addClass("loading").text("Subscribing...");
        
        console.log("Sending AJAX request...");
        
        // Prepare data
        var dataString = 'email=' + encodeURIComponent(emailValue) + '&type=newsletter';
        console.log("Data string:", dataString);
        
        // Submit form via AJAX
        $.ajax({
            type: "POST",
            data: dataString,
            url: "php/requestForm.php",
            cache: false,
            timeout: 10000,
            success: function (response) {
                console.log('AJAX Success - Raw response:', response);
                console.log('Response length:', response.length);
                console.log('Response trimmed:', response.trim());
                
                // Reset button
                submitBtn.prop('disabled', false);
                
                if(response.trim() === 'success') {
                    console.log('Subscription successful!');
                    showSuccess(notification, 'Thank you! You have been successfully subscribed.');
                    email.val('').removeClass("success error");
                    
                    // Auto-hide after 5 seconds
                    setTimeout(function() {
                        notification.removeClass("success").text("");
                    }, 5000);
                } else {
                    console.log('Subscription failed. Response:', response.trim());
                    showError(email, notification, 'Subscription failed: ' + response.trim());
                }
            },
            error: function(xhr, status, error) {
                console.log('AJAX Error occurred!');
                console.log('Status:', status);
                console.log('Error:', error);
                console.log('Response Text:', xhr.responseText);
                console.log('Status Code:', xhr.status);
                
                // Reset button
                submitBtn.prop('disabled', false);
                
                var errorMsg = 'Connection error occurred.';
                if (status === 'timeout') {
                    errorMsg = 'Request timeout. Please try again.';
                } else if (xhr.status === 404) {
                    errorMsg = 'PHP file not found. Check if php/requestForm.php exists.';
                } else if (xhr.status === 500) {
                    errorMsg = 'Server error occurred. Check PHP error logs.';
                }
                
                showError(email, notification, errorMsg);
            }
        });
        
        return false;
    });
    
    // Modal Request Form Handler
    $("#requestForm").submit(function(e) {
        e.preventDefault();
        
        var email = $("#modal-email");
        var submitBtn = $("#modal-submit");
        var submitText = submitBtn.find(".submit-text");
        var loadingText = submitBtn.find(".loading-text");
        var messageDiv = $(".request-form-msg .loading");
        
        // Reset previous states
        email.removeClass("error success");
        messageDiv.hide();
        
        // Validate email field
        if (email.val().trim() == "") {
            showModalError(email, messageDiv, 'Please enter your email address.');
            return false;
        } else if (!isValidEmail(email.val().trim())) {
            showModalError(email, messageDiv, 'Please enter a valid email address.');
            return false;
        } else {
            email.removeClass("error").addClass("success");
        }
        
        // Show loading state
        submitBtn.prop('disabled', true);
        submitText.hide();
        loadingText.show();
        messageDiv.fadeIn("slow").removeClass("error success").text("Processing your request...");
        
        // Prepare data
        var dataString = 'email=' + encodeURIComponent(email.val().trim()) + '&type=discount';
        
        // Submit form via AJAX
        $.ajax({
            type: "POST",
            data: dataString,
            url: "php/requestForm.php",
            cache: false,
            timeout: 15000,
            success: function (response) {
                console.log('Modal form response:', response);
                resetButton(submitBtn, submitText, loadingText);
                email.removeClass("success");
                
                if(response.trim() == 'success') {
                    messageDiv.removeClass("error").addClass("success")
                             .text('Success! Check your email for the 20% discount code.');
                    
                    // Clear form
                    email.val('').removeClass("success error");
                    
                    // Close modal after successful subscription
                    setTimeout(function() {
                        $('#modal-2').modal('hide');
                        messageDiv.fadeOut();
                    }, 3000);
                } else {
                    messageDiv.removeClass("success").addClass("error")
                             .text('Request failed. Please try again later.');
                             
                    setTimeout(function() {
                        messageDiv.fadeOut();
                    }, 4000);
                }
            },
            error: function(xhr, status, error) {
                console.log('Modal AJAX Error:', status, error);
                resetButton(submitBtn, submitText, loadingText);
                
                var errorMsg = 'Connection error. Please try again.';
                if (status === 'timeout') {
                    errorMsg = 'Request timeout. Please check your connection and try again.';
                }
                
                messageDiv.removeClass("success").addClass("error").text(errorMsg);
                setTimeout(function() {
                    messageDiv.fadeOut();
                }, 4000);
            }
        });
        return false;
    });
    
    // Helper Functions
    function isValidEmail(email) {
        var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function showError(emailField, notification, message) {
        emailField.addClass("error").focus();
        notification.removeClass("success loading").addClass("error").text(message);
    }
    
    function showSuccess(notification, message) {
        notification.removeClass("error loading").addClass("success").text(message);
    }
    
    function showModalError(emailField, messageDiv, message) {
        emailField.addClass("error").focus();
        messageDiv.fadeIn('slow').removeClass("success").addClass("error").text(message);
        setTimeout(function() {
            messageDiv.fadeOut();
        }, 3000);
    }
    
    function resetButton(button, submitText, loadingText) {
        button.prop('disabled', false);
        loadingText.hide();
        submitText.show();
    }
    
    // Clear error states when user starts typing
    $("#s-email").on('input', function() {
        $(this).removeClass("error success");
        $("#newsletter-notification").removeClass("error success loading").text("");
    });
    
    $("#modal-email").on('input', function() {
        $(this).removeClass("error success");
        $(".request-form-msg .loading").fadeOut();
    });
    
    // Reset modal form when modal is closed
    $('#modal-2').on('hidden.bs.modal', function () {
        $("#modal-email").val('').removeClass("error success");
        $("#modal-submit").prop('disabled', false);
        $("#modal-submit .submit-text").show();
        $("#modal-submit .loading-text").hide();
        $(".request-form-msg .loading").hide();
    });
    
    // Newsletter form reset functionality
    function resetNewsletterForm() {
        $("#s-email").val('').removeClass("error success");
        $("#newsletter-notification").removeClass("error success loading").text("");
        $("#newsletter-submit").prop('disabled', false);
        $("#newsletter-submit .submit-text").show();
        $("#newsletter-submit .loading-text").hide();
    }
    
    // Expose reset function globally if needed
    window.resetNewsletterForm = resetNewsletterForm;
    
    // Auto-show modal for new visitors (optional)
    // Uncomment the following code if you want the discount modal to auto-show
    /*
    setTimeout(function() {
        if (!sessionStorage.getItem('modalShown')) {
            $('#modal-2').modal('show');
            sessionStorage.setItem('modalShown', 'true');
        }
    }, 5000); // Show after 5 seconds
    */
    
});