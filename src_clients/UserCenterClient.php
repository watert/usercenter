<?php
/**
 * example:
 * $ucc = new UserCenterClient();
 * $user = $ucc->getUser();
 */

class UserCenterClient {
	var $baseUrl = "http://localhost:3000/sso";
	var $checkUrl = "http://localhost:3000/sso/check";
	function currentUrl(){
		return "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
	}
	
	function clearTicket(){
		$currentUrl = $this->currentUrl();
		$url = preg_replace('/(?:&|(\?))' . "ticket" . '=[^&]*(?(1)&|)?/i', "$1", $currentUrl);
		if(substr($url, -1)=="?"){
			$url = substr($url,0,-1);
		}
		header("location: $url");

	}
	function getUser(){
		$baseUrl = $this->baseUrl;
		$checkUrl = $this->checkUrl;
		$currentUrl = $this->currentUrl();

		// SESSION
		session_start();
		if(isset($_SESSION["user"])&&is_array($_SESSION["user"])){
			if(isset($_GET["ticket"])){
				$url = preg_replace('/(?:&|(\?))' . "ticket" . '=[^&]*(?(1)&|)?/i', "$1", $currentUrl);
				if(substr($url, -1)=="?"){
					$url = substr($url,0,-1);
				}
				header("location: $url");

			}
			return $_SESSION["user"];
		}

		// TICKETS
		if(isset($_GET["ticket"]))$ticket = $_GET["ticket"];
		else $ticket = null;
		if($ticket){
			$url = "$checkUrl?ticket=$ticket";
			$user = json_decode(file_get_contents($url),true);
			$_SESSION["user"] = $user;
			UserCenterClient::clearTicket();
			return $user;
		}else {
			$query = http_build_query(array("callback"=>$currentUrl));
			$url = "$baseUrl?$query";
			header("location: $url");
		}
	}
}