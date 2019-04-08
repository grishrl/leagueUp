<?php
	$to = "yoremail@yourdomain.com"; /*Your Email*/
	$subject = "Messsage from Sports Cup Template"; /*Issue*/
	$date = date ("l, F jS, Y");
	$time = date ("h:i A");
	$Email=$_REQUEST['Email'];

	$msg="
	Name: $_REQUEST[Name]
	Email: $_REQUEST[Email]
	Subject: $_REQUEST[Subject]

	Message sent from website on date  $date, hour: $time.\n

	Message:
	$_REQUEST[message]";

	if ($Email=="") {
		echo "<div class='alert alert-danger'>Please enter your email</div>";
	}
	else{
		mail($to, $subject, $msg, "From: $_REQUEST[Email]");
		echo "<div class='alert alert-success'>Thank you for your message..</div>";
	}

?>
