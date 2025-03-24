export const getHealthScoreDescription = (score: number) => {
  if (score >= 80) {
    return "You're very healthy. Keep going!";
  } else if (score >= 60) {
    return 'Your score is fair. Stick to the plan to keep improving!';
  } else if (score >= 40) {
    return 'Your score is low. Follow your action plan and test again!';
  } else {
    return "Your score is very low. Let's make health a priority!";
  }
};
