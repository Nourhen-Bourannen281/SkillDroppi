// components/InteractiveAvatar.js
import { useRef, useEffect, useState } from 'react';

export default function InteractiveAvatar({ email, isPasswordFocused, showPassword }) {
  const svgRef = useRef(null);
  
  // Références pour tous les éléments SVG
  const emailLabelRef = useRef(null);
  const emailRef = useRef(null);
  const passwordLabelRef = useRef(null);
  const passwordRef = useRef(null);
  const showPasswordCheckRef = useRef(null);
  const showPasswordToggleRef = useRef(null);
  const mySVGRef = useRef(null);
  const twoFingersRef = useRef(null);
  const armLRef = useRef(null);
  const armRRef = useRef(null);
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const noseRef = useRef(null);
  const mouthRef = useRef(null);
  const mouthBGRef = useRef(null);
  const mouthSmallBGRef = useRef(null);
  const mouthMediumBGRef = useRef(null);
  const mouthLargeBGRef = useRef(null);
  const mouthMaskPathRef = useRef(null);
  const mouthOutlineRef = useRef(null); // CORRECTION : Défini ici
  const toothRef = useRef(null);
  const tongueRef = useRef(null);
  const chinRef = useRef(null);
  const faceRef = useRef(null);
  const eyebrowRef = useRef(null);
  const outerEarLRef = useRef(null);
  const outerEarRRef = useRef(null);
  const earHairLRef = useRef(null);
  const earHairRRef = useRef(null);
  const hairRef = useRef(null);
  const bodyBGRef = useRef(null);
  const bodyBGchangedRef = useRef(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [elements, setElements] = useState({});

  // Variables d'état
  const stateRef = useRef({
    activeElement: null,
    curEmailIndex: 0,
    screenCenter: 0,
    svgCoords: null,
    emailCoords: null,
    emailScrollMax: 0,
    chinMin: 0.5,
    dFromC: 0,
    mouthStatus: "small",
    blinking: null,
    eyeScale: 1,
    eyesCovered: false,
    showPasswordClicked: false,
    eyeLCoords: null,
    eyeRCoords: null,
    noseCoords: null,
    mouthCoords: null
  });

  // Simple animation function to replace GSAP
  const animateElement = (element, properties, duration = 1000) => {
    if (!element) return;
    
    element.style.transition = `all ${duration}ms ease-out`;
    Object.keys(properties).forEach(prop => {
      if (prop === 'x' || prop === 'y') {
        element.style.transform = `translate(${properties.x || 0}px, ${properties.y || 0}px)`;
      } else if (prop === 'scaleX' || prop === 'scaleY') {
        element.style.transform = `scaleX(${properties.scaleX || 1}) scaleY(${properties.scaleY || 1})`;
      } else if (prop === 'rotation') {
        element.style.transform = `rotate(${properties.rotation || 0}deg)`;
      } else if (prop === 'skewX') {
        element.style.transform = `skewX(${properties.skewX || 0}deg)`;
      } else {
        element.style[prop] = properties[prop];
      }
    });
  };

  const resetElement = (element) => {
    if (!element) return;
    element.style.transition = 'all 1s ease-out';
    element.style.transform = '';
    element.style.opacity = '';
  };

  useEffect(() => {
    if (svgRef.current && !isInitialized) {
      initializeElements();
      initLoginForm();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && emailRef.current) {
      simulateEmailInput();
    }
  }, [email, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (isPasswordFocused) {
        coverEyes();
      } else {
        uncoverEyes();
      }
    }
  }, [isPasswordFocused, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (showPassword) {
        spreadFingers();
      } else {
        closeFingers();
      }
    }
  }, [showPassword, isInitialized]);

  const initializeElements = () => {
    const svg = svgRef.current;
    if (!svg) return;

    setElements({
      emailLabel: emailLabelRef.current,
      email: emailRef.current,
      passwordLabel: passwordLabelRef.current,
      password: passwordRef.current,
      showPasswordCheck: showPasswordCheckRef.current,
      showPasswordToggle: showPasswordToggleRef.current,
      mySVG: mySVGRef.current,
      twoFingers: twoFingersRef.current,
      armL: armLRef.current,
      armR: armRRef.current,
      eyeL: eyeLRef.current,
      eyeR: eyeRRef.current,
      nose: noseRef.current,
      mouth: mouthRef.current,
      mouthBG: mouthBGRef.current,
      mouthSmallBG: mouthSmallBGRef.current,
      mouthMediumBG: mouthMediumBGRef.current,
      mouthLargeBG: mouthLargeBGRef.current,
      mouthMaskPath: mouthMaskPathRef.current,
      mouthOutline: mouthOutlineRef.current, // CORRECTION : Ajouté ici
      tooth: toothRef.current,
      tongue: tongueRef.current,
      chin: chinRef.current,
      face: faceRef.current,
      eyebrow: eyebrowRef.current,
      outerEarL: outerEarLRef.current,
      outerEarR: outerEarRRef.current,
      earHairL: earHairLRef.current,
      earHairR: earHairRRef.current,
      hair: hairRef.current,
      bodyBG: bodyBGRef.current,
      bodyBGchanged: bodyBGchangedRef.current
    });
  };

  const simulateEmailInput = () => {
    if (emailRef.current) {
      emailRef.current.value = email;
      onEmailInput();
    }
  };

  const getPosition = (el) => {
    if (!el) return { x: 0, y: 0 };
    
    let xPos = 0;
    let yPos = 0;

    while (el) {
      if (el.tagName === "BODY") {
        const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
        const yScroll = el.scrollTop || document.documentElement.scrollTop;
        xPos += (el.offsetLeft - xScroll + el.clientLeft);
        yPos += (el.offsetTop - yScroll + el.clientTop);
      } else {
        xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
        yPos += (el.offsetTop - el.scrollTop + el.clientTop);
      }
      el = el.offsetParent;
    }
    return { x: xPos, y: yPos };
  };

  const getAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y1 - y2, x1 - x2);
  };

  const calculateFaceMove = () => {
    const state = stateRef.current;
    if (!state.emailCoords || !elements.email) return;

    const carPos = email.length;
    const div = document.createElement('div');
    const span = document.createElement('span');
    const copyStyle = getComputedStyle(elements.email);
    let caretCoords = {};

    [].forEach.call(copyStyle, function(prop){
      div.style[prop] = copyStyle[prop];
    });
    
    div.style.position = 'absolute';
    div.style.opacity = '0';
    document.body.appendChild(div);
    div.textContent = email.substr(0, carPos);
    span.textContent = email.substr(carPos) || '.';
    div.appendChild(span);

    if (elements.email.scrollWidth <= state.emailScrollMax) {
      caretCoords = getPosition(span);
      state.dFromC = state.screenCenter - (caretCoords.x + state.emailCoords.x);
      
      if (state.eyeLCoords && state.eyeRCoords && state.noseCoords && state.mouthCoords) {
        state.eyeLAngle = getAngle(state.eyeLCoords.x, state.eyeLCoords.y, state.emailCoords.x + caretCoords.x, state.emailCoords.y + 25);
        state.eyeRAngle = getAngle(state.eyeRCoords.x, state.eyeRCoords.y, state.emailCoords.x + caretCoords.x, state.emailCoords.y + 25);
        state.noseAngle = getAngle(state.noseCoords.x, state.noseCoords.y, state.emailCoords.x + caretCoords.x, state.emailCoords.y + 25);
        state.mouthAngle = getAngle(state.mouthCoords.x, state.mouthCoords.y, state.emailCoords.x + caretCoords.x, state.emailCoords.y + 25);
      }
    } else {
      if (state.eyeLCoords && state.eyeRCoords && state.noseCoords && state.mouthCoords) {
        state.eyeLAngle = getAngle(state.eyeLCoords.x, state.eyeLCoords.y, state.emailCoords.x + state.emailScrollMax, state.emailCoords.y + 25);
        state.eyeRAngle = getAngle(state.eyeRCoords.x, state.eyeRCoords.y, state.emailCoords.x + state.emailScrollMax, state.emailCoords.y + 25);
        state.noseAngle = getAngle(state.noseCoords.x, state.noseCoords.y, state.emailCoords.x + state.emailScrollMax, state.emailCoords.y + 25);
        state.mouthAngle = getAngle(state.mouthCoords.x, state.mouthCoords.y, state.emailCoords.x + state.emailScrollMax, state.emailCoords.y + 25);
      }
    }

    if (state.eyeLAngle !== undefined) {
      const eyeLX = Math.cos(state.eyeLAngle) * 20;
      const eyeLY = Math.sin(state.eyeLAngle) * 10;
      const eyeRX = Math.cos(state.eyeRAngle) * 20;
      const eyeRY = Math.sin(state.eyeRAngle) * 10;
      const noseX = Math.cos(state.noseAngle) * 23;
      const noseY = Math.sin(state.noseAngle) * 10;
      const mouthX = Math.cos(state.mouthAngle) * 23;
      const mouthY = Math.sin(state.mouthAngle) * 10;
      const mouthR = Math.cos(state.mouthAngle) * 6;
      const chinX = mouthX * .8;
      const chinY = mouthY * .5;
      let chinS = 1 - ((state.dFromC * .15) / 100);
      
      if (chinS > 1) {
        chinS = 1 - (chinS - 1);
        if (chinS < state.chinMin) {
          chinS = state.chinMin;	
        }
      }
      
      const faceX = mouthX * .3;
      const faceY = mouthY * .4;
      const faceSkew = Math.cos(state.mouthAngle) * 5;
      const eyebrowSkew = Math.cos(state.mouthAngle) * 25;
      const outerEarX = Math.cos(state.mouthAngle) * 4;
      const outerEarY = Math.cos(state.mouthAngle) * 5;
      const hairX = Math.cos(state.mouthAngle) * 6;
      const hairS = 1.2;

      // Animation avec notre fonction custom
      animateElement(elements.eyeL, { x: -eyeLX, y: -eyeLY });
      animateElement(elements.eyeR, { x: -eyeRX, y: -eyeRY });
      animateElement(elements.nose, { x: -noseX, y: -noseY, rotation: mouthR });
      animateElement(elements.mouth, { x: -mouthX, y: -mouthY, rotation: mouthR });
      animateElement(elements.chin, { x: -chinX, y: -chinY, scaleY: chinS });
      animateElement(elements.face, { x: -faceX, y: -faceY, skewX: -faceSkew });
      animateElement(elements.eyebrow, { x: -faceX, y: -faceY, skewX: -eyebrowSkew });
      animateElement(elements.outerEarL, { x: outerEarX, y: -outerEarY });
      animateElement(elements.outerEarR, { x: outerEarX, y: outerEarY });
      animateElement(elements.earHairL, { x: -outerEarX, y: -outerEarY });
      animateElement(elements.earHairR, { x: -outerEarX, y: outerEarY });
      animateElement(elements.hair, { x: hairX, scaleY: hairS });
    }

    if (document.body.contains(div)) {
      document.body.removeChild(div);
    }
  };

  const onEmailInput = () => {
    calculateFaceMove();
    const value = email;
    stateRef.current.curEmailIndex = value.length;

    if (stateRef.current.curEmailIndex > 0) {
      if (stateRef.current.mouthStatus === "small") {
        stateRef.current.mouthStatus = "medium";
        // Simple visibility toggle for mouth states
        if (elements.mouthMediumBG) {
          elements.mouthMediumBG.style.display = 'block';
          elements.mouthSmallBG.style.display = 'none';
          elements.mouthLargeBG.style.display = 'none';
        }
        animateElement(elements.tooth, { x: 0, y: 0 });
        animateElement(elements.tongue, { x: 0, y: 1 });
        animateElement(elements.eyeL, { scaleX: 0.85, scaleY: 0.85 });
        animateElement(elements.eyeR, { scaleX: 0.85, scaleY: 0.85 });
        stateRef.current.eyeScale = 0.85;
      }
      
      if (value.includes("@")) {
        stateRef.current.mouthStatus = "large";
        if (elements.mouthLargeBG) {
          elements.mouthLargeBG.style.display = 'block';
          elements.mouthSmallBG.style.display = 'none';
          elements.mouthMediumBG.style.display = 'none';
        }
        animateElement(elements.tooth, { x: 3, y: -2 });
        animateElement(elements.tongue, { y: 2 });
        animateElement(elements.eyeL, { scaleX: 0.65, scaleY: 0.65 });
        animateElement(elements.eyeR, { scaleX: 0.65, scaleY: 0.65 });
        stateRef.current.eyeScale = 0.65;
      } else {
        stateRef.current.mouthStatus = "medium";
        if (elements.mouthMediumBG) {
          elements.mouthMediumBG.style.display = 'block';
          elements.mouthSmallBG.style.display = 'none';
          elements.mouthLargeBG.style.display = 'none';
        }
        animateElement(elements.tooth, { x: 0, y: 0 });
        animateElement(elements.tongue, { x: 0, y: 1 });
        animateElement(elements.eyeL, { scaleX: 0.85, scaleY: 0.85 });
        animateElement(elements.eyeR, { scaleX: 0.85, scaleY: 0.85 });
        stateRef.current.eyeScale = 0.85;
      }
    } else {
      stateRef.current.mouthStatus = "small";
      if (elements.mouthSmallBG) {
        elements.mouthSmallBG.style.display = 'block';
        elements.mouthMediumBG.style.display = 'none';
        elements.mouthLargeBG.style.display = 'none';
      }
      animateElement(elements.tooth, { x: 0, y: 0 });
      animateElement(elements.tongue, { y: 0 });
      animateElement(elements.eyeL, { scaleX: 1, scaleY: 1 });
      animateElement(elements.eyeR, { scaleX: 1, scaleY: 1 });
      stateRef.current.eyeScale = 1;
    }
  };

  const coverEyes = () => {
    if (stateRef.current.eyesCovered) return;
    
    if (elements.armL && elements.armR) {
      elements.armL.style.visibility = "visible";
      elements.armR.style.visibility = "visible";
      
      animateElement(elements.armL, { x: -93, y: 10, rotation: 0 }, 450);
      setTimeout(() => {
        animateElement(elements.armR, { x: -93, y: 10, rotation: 0 }, 450);
      }, 100);
    }
    stateRef.current.eyesCovered = true;
  };

  const uncoverEyes = () => {
    if (!stateRef.current.eyesCovered) return;
    
    if (elements.armL && elements.armR) {
      animateElement(elements.armL, { y: 220 }, 1350);
      setTimeout(() => {
        animateElement(elements.armL, { rotation: 105 }, 1350);
      }, 100);
      
      animateElement(elements.armR, { y: 220 }, 1350);
      setTimeout(() => {
        animateElement(elements.armR, { rotation: -105 }, 1350);
      }, 100);
      
      // Hide arms after animation
      setTimeout(() => {
        if (elements.armL && elements.armR) {
          elements.armL.style.visibility = "hidden";
          elements.armR.style.visibility = "hidden";
        }
      }, 1500);
    }
    stateRef.current.eyesCovered = false;
  };

  const spreadFingers = () => {
    if (elements.twoFingers) {
      animateElement(elements.twoFingers, { rotation: 30, x: -9, y: -2 }, 350);
    }
  };

  const closeFingers = () => {
    if (elements.twoFingers) {
      animateElement(elements.twoFingers, { rotation: 0, x: 0, y: 0 }, 350);
    }
  };

  const resetFace = () => {
    [elements.eyeL, elements.eyeR, elements.nose, elements.mouth, elements.chin, 
     elements.face, elements.eyebrow, elements.outerEarL, elements.outerEarR, 
     elements.earHairL, elements.earHairR, elements.hair].forEach(resetElement);
  };

  const initLoginForm = () => {
    const state = stateRef.current;
    
    if (elements.mySVG) {
      // Mesures pour les éléments SVG
      state.svgCoords = getPosition(elements.mySVG);
      state.screenCenter = state.svgCoords.x + (elements.mySVG.getBoundingClientRect().width / 2);
      state.eyeLCoords = { x: state.svgCoords.x + 84, y: state.svgCoords.y + 76 };
      state.eyeRCoords = { x: state.svgCoords.x + 113, y: state.svgCoords.y + 76 };
      state.noseCoords = { x: state.svgCoords.x + 97, y: state.svgCoords.y + 81 };
      state.mouthCoords = { x: state.svgCoords.x + 100, y: state.svgCoords.y + 100 };
    }
    
    // Position initiale des bras
    if (elements.armL && elements.armR) {
      elements.armL.style.visibility = "hidden";
      elements.armR.style.visibility = "hidden";
    }
    
    // Déterminer la largeur de défilement maximale
    state.emailScrollMax = elements.email?.scrollWidth || 0;
  };

  return (
    <div className="avatar-container">
      <svg 
        ref={svgRef} 
        className="interactive-avatar" 
        width="200" 
        height="200" 
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="mouthMaskPath" ref={mouthMaskPathRef} d="M100,122c20,0,40-11,40-25s-18-25-40-25S60,72,60,85S80,122,100,122z"/>
        </defs>
        
        {/* Corps */}
        <g className="body">
          <path ref={bodyBGRef} className="bodyBGnormal" d="M100,182c45,0,65-15,65-40s-10-40-65-40S35,127,35,142S55,182,100,182z"/>
          <path ref={bodyBGchangedRef} className="bodyBGchanged" d="M100,182c45,0,65-15,65-40s-10-40-65-40S35,127,35,142S55,182,100,182z"/>
        </g>
        
        {/* Bras */}
        <g className="arms">
          <path ref={armLRef} className="armL" fill="#9CD8C9" d="M93,112c0,0-43,8-45,21s12,20,12,20s32-6,40-18S93,112,93,112z"/>
          <path ref={armRRef} className="armR" fill="#9CD8C9" d="M107,112c0,0,43,8,45,21s-12,20-12,20s-32-6-40-18S107,112,107,112z"/>
        </g>
        
        {/* Visage */}
        <g ref={faceRef} className="face">
          {/* Oreilles */}
          <g className="earL">
            <path ref={outerEarLRef} className="outerEar" fill="#FFAAA6" d="M75,80c0,0-5,13,0,20s15,5,15,5"/>
            <path ref={earHairLRef} className="earHair" fill="#FFE4E2" d="M75,80c0,0-5,13,0,20s15,5,15,5"/>
          </g>
          <g className="earR">
            <path ref={outerEarRRef} className="outerEar" fill="#FFAAA6" d="M125,80c0,0,5,13,0,20s-15,5-15,5"/>
            <path ref={earHairRRef} className="earHair" fill="#FFE4E2" d="M125,80c0,0,5,13,0,20s-15,5-15,5"/>
          </g>
          
          {/* Yeux */}
          <g className="eyeL">
            <ellipse className="eyeBL" cx="84" cy="76" rx="9.5" ry="11.5" fill="#FFFFFF"/>
            <path ref={eyeLRef} className="eyeL" fill="#7B8C8D" d="M84,76c0,5-4,9-9,9s-9-4-9-9s4-9,9-9S84,71,84,76z"/>
          </g>
          <g className="eyeR">
            <ellipse className="eyeBR" cx="113" cy="76" rx="9.5" ry="11.5" fill="#FFFFFF"/>
            <path ref={eyeRRef} className="eyeR" fill="#7B8C8D" d="M113,76c0,5-4,9-9,9s-9-4-9-9s4-9,9-9S113,71,113,76z"/>
          </g>
          
          {/* Nez */}
          <g ref={noseRef} className="nose">
            <path fill="#FFAAA6" d="M100,90c0,0,10,5,0,12s-15,0-15,0S90,90,100,90z"/>
          </g>
          
          {/* Bouche */}
          <g ref={mouthRef} className="mouth">
            <path ref={mouthBGRef} className="mouthBG" fill="#FFFFFF" d="M100,122c20,0,40-11,40-25s-18-25-40-25S60,72,60,85S80,122,100,122z"/>
            <path ref={mouthOutlineRef} className="mouthOutline" fill="none" stroke="#7B8C8D" strokeWidth="2" d="M100,122c20,0,40-11,40-25s-18-25-40-25S60,72,60,85S80,122,100,122z"/>
            
            <path ref={mouthSmallBGRef} className="mouthSmallBG" fill="#FFFFFF" d="M100,122c10,0,20-5,20-11s-9-11-20-11S80,106,80,112S90,122,100,122z"/>
            <path ref={mouthMediumBGRef} className="mouthMediumBG" fill="#FFFFFF" d="M100,122c15,0,30-8,30-18s-13-18-30-18S70,95,70,104S85,122,100,122z"/>
            <path ref={mouthLargeBGRef} className="mouthLargeBG" fill="#FFFFFF" d="M100,122c20,0,40-11,40-25s-18-25-40-25S60,72,60,85S80,122,100,122z"/>
            
            <path ref={toothRef} className="tooth" fill="#FFFFFF" d="M95,97h10v5h-5l-5,2V97z"/>
            <path ref={tongueRef} className="tongue" fill="#FF8480" d="M90,105c0,0,10,7,20,0s0-5,0-5H90V105z"/>
          </g>
          
          {/* Menton */}
          <path ref={chinRef} className="chin" fill="#FFAAA6" d="M100,130c15,0,25-5,25-10s-10-10-25-10S75,115,75,120S85,130,100,130z"/>
        </g>
        
        {/* Sourcils */}
        <g ref={eyebrowRef} className="eyebrow">
          <path fill="#7B8C8D" d="M75,65c0,0,10-5,20,0"/>
          <path fill="#7B8C8D" d="M125,65c0,0-10-5-20,0"/>
        </g>
        
        {/* Cheveux */}
        <path ref={hairRef} className="hair" fill="#4A4A4A" d="M100,50c0,0-25-10-25,5s0,25,0,25s10-5,25-5s25,5,25,5s0-15,0-25S100,50,100,50z"/>
        
        {/* Doigts */}
        <g ref={twoFingersRef} className="twoFingers">
          <path fill="#9CD8C9" d="M115,125c0,0-5,10,0,15s10,0,10,0"/>
          <path fill="#9CD8C9" d="M120,125c0,0-5,10,0,15s10,0,10,0"/>
        </g>
      </svg>
      
      {/* Champ email simulé pour les calculs (caché) */}
      <input
        ref={emailRef}
        type="email"
        className="simulated-email"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          top: '-1000px'
        }}
      />
    </div>
  );
}