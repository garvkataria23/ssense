// JavaScript Document
$(document).ready(function() {

    "use strict";

    $(".booking-form").submit(function(e) {
        e.preventDefault();
        var firstname = $(".firstname");
        var lastname = $(".lastname");
        var email = $(".email");
        var phone = $(".phone");
        var service = $(".service");
        var staff = $(".staff");
        var date = $(".date");
        var flag = false;
        var requiredFields = [firstname, lastname, email, phone, service, staff, date];
        if (firstname.val() == "") {
            firstname.addClass("error");
            firstname.focus();
            flag = false;
            return false;
        } else {
            firstname.removeClass("error").addClass("success");
        } if (lastname.val() == "") {
            lastname.addClass("error");
            lastname.focus();
            flag = false;
            return false;
        } else {
            lastname.removeClass("error").addClass("success");
        } if (email.val() == "") {
            email.addClass("error");
            email.focus();
            flag = false;
            return false;
        } else {
            email.removeClass("error").addClass("success");
        } if (phone.val() == "") {
            phone.addClass("error");
            phone.focus();
            flag = false;
            return false;
        } else {
            phone.removeClass("error").addClass("success");
        } if (!service.val()) {
            service.addClass("error");
            service.focus();
            flag = false;
            return false;
        } else {
            service.removeClass("error").addClass("success");
        } if (!staff.val()) {
            staff.addClass("error");
            staff.focus();
            flag = false;
            return false;
        } else {
            staff.removeClass("error").addClass("success");
        } if (date.val() == "") {
            date.addClass("error");
            date.focus();
            flag = false;
            return false;
        } else {
            date.removeClass("error").addClass("success");
            flag = true;
        }
        if (flag) {
            var message = encodeURIComponent(
                "Hi S.Sense, I would like to book an appointment.\n\n" +
                "Name: " + firstname.val() + " " + lastname.val() + "\n" +
                "Email: " + email.val() + "\n" +
                "Phone: " + phone.val() + "\n" +
                "Service: " + service.val() + "\n" +
                "Preferred Staff: " + staff.val() + "\n" +
                "Preferred Date/Time: " + date.val() + "\n\n" +
                "Please confirm availability."
            );
            var whatsappUrl = "https://wa.me/918054777888?text=" + message;
            $(".loading").fadeIn("slow").html('<font color="#48af4b">Opening WhatsApp to confirm your request...</font>').delay(3000).fadeOut('slow');
            requiredFields.forEach(function(field) { field.removeClass("success"); });
            window.open(whatsappUrl, "_blank");
        }
        return false;
    });
    $("#reset").on('click', function() {
        $(".form-control").removeClass("success").removeClass("error");
    });

    /*----------------------------------------------------*/
    /*  Booking Form Validation
    /*----------------------------------------------------*/

    $(".booking-form").validate({
        rules: {
            select: "required",
            firstname: "required",
            lastname: "required",
            email: {
                required: true,
                email: true
            },
            phone:{
                required: true,
                digits: true,
            }
        },
        messages: {
            select: "This field is required",
            firstname: "Please enter your first name",
            lastname: "Please enter your last name",
            email: "We need your email address to contact you",
            phone: "Please enter a valid number",
        }
    });

})

