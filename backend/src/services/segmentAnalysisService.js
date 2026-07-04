exports.calculateNetInterestScore = (feedbackList) => {
  if (!feedbackList.length) return 0;
  const numInteresting = feedbackList.filter(f => f.isInteresting).length;
  const numUninteresting = feedbackList.filter(f => !f.isInteresting).length;
  const totalFlags = numInteresting + numUninteresting;
  if (totalFlags === 0) return 0;
  return (numInteresting - numUninteresting) / totalFlags;
};

exports.aggregateFeedback = (feedbackList) => {
  return {
    numInterestingFlags: feedbackList.filter(f => f.isInteresting).length,
    numUninterestingFlags: feedbackList.filter(f => !f.isInteresting).length,
    netInterestScore: exports.calculateNetInterestScore(feedbackList),
  };
};
