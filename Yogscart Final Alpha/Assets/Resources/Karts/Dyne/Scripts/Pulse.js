    var colorStart : Color;
    var colorEnd : Color;
    var duration = 2.0;
     
    function Start () {
      colorStart = renderer.material.color;
      colorEnd = Color(colorStart.r, colorStart.g, colorStart.b, 0.10);
      Fade();
    }
 
     function Fade ()
    {
	while (true) {
      for (var t = 0.0; t < duration; t += Time.deltaTime) {
        renderer.material.color = Color.Lerp (colorStart, colorEnd, t/duration);
        yield;
       }
	   for (t = 0.0; t < duration; t += Time.deltaTime) {
        renderer.material.color = Color.Lerp (colorEnd, colorStart, t/duration);
        yield;
      }
	  }
    }
 
     
