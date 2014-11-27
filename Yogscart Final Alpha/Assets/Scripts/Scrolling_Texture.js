#pragma strict

	// Scroll main texture based on time
	var scrollSpeed : float = 0.5;
	
	function FixedUpdate () {
		var offset : float = Time.time * scrollSpeed;
		renderer.material.SetTextureOffset ("_MainTex", Vector2(0,-offset));
	}