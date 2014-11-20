var scaleCheckTarget:Transform;
var isUseLocalScale:boolean = false;

var isSizeControll:boolean = false;
var sizeAmp:float = 1.0;
var isEmissionControll:boolean = false;
var emissionAmp:float = 1.0;
var minEmissionLimit:float = 0;
var maxEmissionLimit:float = 0;

var isWorldVelocityControll:boolean = false;
var worldVelocityAmp:Vector3 = Vector3.one;
var isLocalVelocityControll:boolean = false;
var localVelocityAmp:Vector3 = Vector3.one;

var isDampingControll:boolean = false;
var dampingAmp:float = 1.0;
var isSizeGrowControll:boolean = false;
var sizeGrowAmp:float = 1.0;
var isForceControll:boolean = false;
var forceAmp:Vector3 = Vector3.one;
var isRndForceControll:boolean = false;
var rndForceAmp:Vector3 = Vector3.one;

var isActivePropertyMode:boolean = false;

private var savedScale:Vector3;
private var ampBase:float;
private var startMinSize:float; 
private var startMaxSize:float; 
private var startMinEmission:float; 
private var startMaxEmission:float; 

private var startWorldVelocity:Vector3;
private var startLocalVelocity:Vector3;

private var particleAnimator:ParticleAnimator;
private var startDamping:float;
private var startSizeGrow:float;
private var startForce:Vector3;
private var startRndForce:Vector3;

private var isSizeControll_current:boolean;
private var isEmissionControll_current:boolean;
private var isWorldVelocityControll_current:boolean;
private var isLocalVelocityControll_current:boolean;
private var isDampingControll_current:boolean;
private var isSizeGrowControll_current:boolean;
private var isForceControll_current:boolean;
private var isRndForceControll_current:boolean;

private var myTransform:Transform;

function Awake() {
    ampBase = Mathf.Sqrt(3);
}

function Start() {
    getTargetTransform();

    saveScale();
    
    startMinSize = particleEmitter.minSize;
    startMaxSize = particleEmitter.maxSize;
    startMinEmission = particleEmitter.minEmission;
    startMaxEmission = particleEmitter.maxEmission;
    
    startWorldVelocity = particleEmitter.worldVelocity;
    startLocalVelocity = particleEmitter.localVelocity;
    
    particleAnimator = GetComponent(ParticleAnimator);
    startDamping = particleAnimator.damping;
    startSizeGrow = particleAnimator.sizeGrow;
    startForce = particleAnimator.force;
    startRndForce = particleAnimator.rndForce;

    doScaling();
}

function Update() {
    if (checkScaleUpdate() || checkPropertyUpdate()) {
        doScaling();
    }
}

private function getTargetTransform():Transform {
    myTransform = (scaleCheckTarget == null) ? transform : scaleCheckTarget;
    return myTransform;
}

private function saveScale():void {
    if (isUseLocalScale) {
        savedScale = myTransform.localScale;
    } else {
        savedScale = myTransform.lossyScale;
    }
}

private function checkScaleUpdate():boolean {
    getTargetTransform();
    if (isUseLocalScale) {
        return (myTransform.localScale != savedScale);
    } else {
        return (myTransform.lossyScale != savedScale);
    }
}

private function checkPropertyUpdate() {
    if (isActivePropertyMode && (
        (isSizeControll != isSizeControll_current) || (isEmissionControll != isEmissionControll_current) 
        || (isWorldVelocityControll != isWorldVelocityControll_current) || (isLocalVelocityControll != isLocalVelocityControll_current) 
        || (isDampingControll != isDampingControll_current) || (isSizeGrowControll != isSizeGrowControll_current)
        || (isForceControll != isForceControll_current) || (isRndForceControll != isRndForceControll_current)
    )) {
        return true;
    } else {
        return false;
    }
}

private function paramLimiter(param_, limit_):float {
    if (limit_ > 0) {
        return Mathf.Min(param_, limit_);
    } else {
        return param_;
    }
}


function doScaling():void {
    saveScale();
    var newSize:float = (savedScale.magnitude /ampBase);
    if (particleEmitter != null) {
        if (isSizeControll) {
            particleEmitter.minSize = newSize *startMinSize *sizeAmp;
            particleEmitter.maxSize = newSize *startMaxSize *sizeAmp;
        }
        if (isEmissionControll) {
            particleEmitter.minEmission = paramLimiter(newSize *startMinEmission *emissionAmp, maxEmissionLimit);
            particleEmitter.maxEmission = paramLimiter(newSize *startMaxEmission *emissionAmp, maxEmissionLimit);
        }
        if (isWorldVelocityControll) {
            particleEmitter.worldVelocity = Vector3.Scale(Vector3.Scale(savedScale, startWorldVelocity), worldVelocityAmp);
        }
        if (isLocalVelocityControll) {
            particleEmitter.localVelocity = Vector3.Scale(Vector3.Scale(savedScale, startLocalVelocity), localVelocityAmp);
        }
        
        if (isActivePropertyMode) {
            if (!isSizeControll) {
                particleEmitter.minSize = startMinSize;
                particleEmitter.maxSize = startMaxSize;
            }
            if (!isEmissionControll) {
                particleEmitter.minEmission = startMinEmission;
                particleEmitter.maxEmission = startMaxEmission;
            }
            if (!isWorldVelocityControll) {
                particleEmitter.worldVelocity = startWorldVelocity;
            }
            if (!isLocalVelocityControll) {
                particleEmitter.localVelocity = startLocalVelocity;
            }
        }
    }

    if (particleAnimator != null) {
        if (isDampingControll) {
            particleAnimator.damping = newSize *startDamping *dampingAmp;
        }
        if (isSizeGrowControll) {
            particleAnimator.sizeGrow = newSize *startSizeGrow *sizeGrowAmp;
        }
        if (isForceControll) {
            particleAnimator.force = Vector3.Scale(Vector3.Scale(savedScale, startForce), forceAmp);
        }
        if (isRndForceControll) {
            particleAnimator.rndForce =Vector3.Scale(Vector3.Scale(savedScale, startRndForce), rndForceAmp);
        }
        
        if (isActivePropertyMode) {
            if (!isDampingControll) {
                particleAnimator.damping = startDamping;
            }
            if (!isSizeGrowControll) {
                particleAnimator.sizeGrow = startSizeGrow;
            }
            if (!isForceControll) {
                particleAnimator.force = startForce;
            }
            if (!isRndForceControll) {
                particleAnimator.rndForce = startRndForce;
            }
        }
    }
    if (isActivePropertyMode) {
        isSizeControll_current = isSizeControll;
        isEmissionControll_current = isEmissionControll;
        isWorldVelocityControll_current = isWorldVelocityControll;
        isLocalVelocityControll_current = isLocalVelocityControll;
        isDampingControll_current = isDampingControll;
        isSizeGrowControll_current = isSizeGrowControll;
        isForceControll_current = isForceControll;
        isRndForceControll_current = isRndForceControll;
    }
}