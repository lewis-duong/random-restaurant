"use client";

const ResultModal = ({ styles, chosenlocation, showResult }) => {
  return (
    <>
      <div
        className={` ${styles.resultMessage} ${showResult ? styles.show : ""}`}
        role="alert"
        aria-live="polite"
      >
        <h1>
          <span className={styles.resultText}>Let's have</span>
          <br />
          <span className={styles.locationName}>{chosenlocation}</span>
          <br />
          <span className={styles.resultText}>tonight!</span>
        </h1>
      </div>
    </>
  );
};

export default ResultModal;
