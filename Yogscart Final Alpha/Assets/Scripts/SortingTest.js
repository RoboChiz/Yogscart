#pragma strict

var TestArray : TestRacer[];

function Start () {

var debugString : String = "The starting order is";

TestArray = new TestRacer[12];
for(var i : int = 0; i < TestArray.Length; i++)
{
TestArray[i] = new TestRacer();
TestArray[i].currentTotal = Random.Range(0,10);
TestArray[i].currentDistance = Random.Range(0,10);

debugString += ", " + TestArray[i].currentTotal.ToString() +"/"+ TestArray[i].currentDistance.ToString();
}

Debug.Log(debugString);

var timePassed : float;
var startTime = Time.realtimeSinceStartup;

CalculatePositions(TestArray);

/*
Debug.Log("Starting QuickSort");
quickSort(TestArray,0,TestArray.Length-1);


timePassed = Time.realtimeSinceStartup - startTime;
Debug.Log("Finished QuickSort in " + timePassed.ToString() + " seconds.");

debugString = "The correct order is";
for(i = 0; i < TestArray.Length; i++)
{
debugString += ", " + TestArray[i].currentTotal.ToString() +"/"+ TestArray[i].currentDistance.ToString();
}
Debug.Log(debugString);
*/

}

//Used for testing only. Delete before release
class TestRacer
{
var currentTotal : int;
var currentDistance : float;
var position : int;
}
//Used for testing only. Delete before release

/*function quicksort(array)
    if length(array) > 1
        pivot := select any element of array
        left := first index of array
        right := last index of array
        while left ≤ right
            while array[left] < pivot
                left := left + 1
            while array[right] > pivot
                right := right - 1
            if left ≤ right
                swap array[left] with array[right]
                left := left + 1
                right := right - 1
        quicksort(array from first index to right)
        quicksort(array from left to last index)*/
function CalculatePositions(array : TestRacer[])
{

var sortedArray = new TestRacer[array.Length];

for(var i : int = 0; i < sortedArray.Length; i++)
{
sortedArray[i] = array[i];
}

quickSort(sortedArray,0,sortedArray.Length-1);

for(i = 0; i < sortedArray.Length; i++)
{
sortedArray[i].position = i;
}

}

function quickSort(array : TestRacer[],left : int, right : int)
{
if(right - left >= 1)
{

//Debug.Log("Quick Sorting between " + left + " and " + right);

var pivot : int = (right + left)/2;
var leftCheck : int = left;
var rightCheck : int = right;

while(leftCheck < rightCheck)
{
	while(array[leftCheck].currentTotal > array[pivot].currentTotal || 
		(array[leftCheck].currentTotal == array[pivot].currentTotal && array[leftCheck].currentDistance < array[pivot].currentDistance))
			leftCheck += 1;
			
	while(array[rightCheck].currentTotal < array[pivot].currentTotal || 
		(array[rightCheck].currentTotal == array[pivot].currentTotal && array[rightCheck].currentDistance > array[pivot].currentDistance))
			rightCheck -= 1;
			
	if(leftCheck < rightCheck)
	{
		//Debug.Log("Swapping " + leftCheck.ToString() + " & " + rightCheck.ToString());
		
		if(leftCheck == pivot)
		{
			pivot = rightCheck;	
			//Debug.Log("pivot has swapped " + pivot.ToString());	
		}
		else if(rightCheck == pivot)
		{
			pivot = leftCheck;
			//Debug.Log("pivot has swapped " + pivot.ToString());	
		}
		
		Swap(array,leftCheck,rightCheck);
		
		if(leftCheck != pivot)
		leftCheck += 1;
		
		if(rightCheck != pivot)
		rightCheck -= 1;

	}


}

quickSort(array,left,pivot - 1);
quickSort(array,pivot + 1,right);

}

return;
	
}




function Swap(array : TestRacer[], a : int, b : int)
{

var holder = array[a];

array[a] = array[b];
array[b] = holder;

return;

}