// components/LightningTest.tsx

const LightningTest = () => {
  return (
    // We use a React Fragment (<>) to hold our style and div
    <>
      <style>{`
        @keyframes test-flicker {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .animate-test {
          animation: test-flicker 2s infinite;
        }
      `}</style>

      <div
        className="animate-test"
        style={{
          width: '200px',
          height: '200px',
          backgroundColor: '#ff0000', // A bright red color
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          margin: '20px',
        }}
      >
        Is this box flickering?
      </div>
    </>
  );
};

export default LightningTest;