import { UndoIcon } from 'lucide-react';
import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export const SignatureBlock: React.FC = () => {
  // TODO: save signature (?)
  const canvasRef = useRef<SignatureCanvas | null>(null);
  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
  };

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showPencil, setShowPencil] = useState(false);
  const divRef = useRef<any>(null);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;
    const boundingRect = divRef?.current?.getBoundingClientRect();
    setPosition({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-white">Sign below:</p>
        <UndoIcon
          className="size-10 cursor-pointer p-2 text-white/50 hover:text-white"
          onClick={() => clearCanvas()}
        />
      </div>
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowPencil(true)}
        onMouseLeave={() => setShowPencil(false)}
        ref={divRef}
        onMouseMove={handleMouseMove}
      >
        <SignatureCanvas
          ref={canvasRef}
          penColor="white"
          canvasProps={{
            className:
              'w-full h-60 sigCanvas border border-white/40 bg-white/10 rounded-xl cursor-none',
          }}
        />
        {/* pencil icon */}
        <div
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y - 30,
            opacity: showPencil ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
            height: 30,
            width: 30,
          }}
        >
          <div
            style={{
              width: 3,
              height: 3,
              backgroundColor: 'white',
              position: 'absolute',
              bottom: 1,
              left: 1,
            }}
          />
          <div
            style={{
              transform: 'rotate(45deg)',
              height: 20,
              width: 4,
              position: 'absolute',
              backgroundColor: 'white',
              bottom: 0,
              left: 8,
            }}
          />
        </div>
        {/* pencil icon */}
      </div>
    </div>
  );
};

// export const CommitmentContent = ({ onComplete }) => {
//   const canvasRef = useRef<SignatureCanvas | null>(null);
//   // todo: save signature (?)
//   const clearCanvas = () => {
//     if (canvasRef.current) {
//       canvasRef.current.clear();
//     }
//   };
//
//   return (
//     <div className="text-white xs:max-w-xs md:max-w-2xl mx-10 mt-32">
//       <div className="space-y-14 md:space-y-20">
//         <h3 className="text-white text-2xl light">Your commitment to health</h3>
//         <div className="space-y-16 light">
//           <div className="flex flex-row items-center space-x-10">
//             <span>1.</span>
//             <h1 className="text-white text-3xl md:text-6xl leading-[2rem] md:leading-[4.5rem]">
//               Commit to putting health first, always.
//             </h1>
//           </div>
//           <div className="flex flex-row items-center space-x-10">
//             <span>2.</span>
//             <h1 className="text-white text-3xl md:text-6xl leading-[2rem] md:leading-[4.5rem]">
//               Recognize that optimal health is a journey, not a destination.
//             </h1>
//           </div>
//           <div className="flex flex-row items-center space-x-10">
//             <span>3.</span>
//             <h1 className="text-white text-3xl md:text-6xl leading-[2rem] md:leading-[4.5rem]">
//               Understand that your health is the foundation to success, personal
//               & professional.
//             </h1>
//           </div>
//         </div>
//       </div>
//       <div className="mt-20 mb-10 mt-20 mb-10 w-full flex flex-row justify-between">
//         <h3 className="text-white text-2xl light">
//           Add your signature in the box below:
//         </h3>
//         <div
//           className="opacity-50 cursor-pointer"
//           onClick={() => clearCanvas()}
//         >
//           <UndoIcon />
//         </div>
//       </div>
//
//       <SignatureBlock />
//       <div className="flex justify-center mt-10 pb-80">
//         <NextButton enabled onClick={onComplete} />
//       </div>
//     </div>
//   );
// };
