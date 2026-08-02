const PARAMETERS = {
    alpha: 1.7,
    C95_Flagship: 150,
    C95_NonFlagship: 250,
    FlagshipBonus: 12,
    Weight_Impact: 0.3,
    Weight_Journal: 0.7
};
function calculateScore(input) { 
  // Khai báo Tham số (Parameters)
  const {
    alpha,
    FlagshipBonus,
    C95_Flagship,
    C95_NonFlagship,
    Weight_Journal,
    Weight_Impact
} = PARAMETERS;

  const sjr = Number(input.sjr_percentile_p); 
  const cites = Number(input.cites_3_5y);     
  const role = Number(input.role_weight);    
  const flagship = input.is_flagship === true || input.is_flagship === "1";
  const C95 = flagship ? C95_Flagship : C95_NonFlagship;
 
  const JournalBaseScoreNoBonus = Math.pow((100 - sjr) / 100, alpha) * 100;
  
  const JournalBonus = flagship ? FlagshipBonus : 0;
  const JournalBase = JournalBaseScoreNoBonus + JournalBonus;
  const JournalScore = Math.min(100, JournalBase);

  const ImpactScoreBase = Math.min(100 * Math.log10(1 + cites) / Math.log10(1 + C95));
  
  const ImpactScore = Math.min(100, ImpactScoreBase);

  const PaperScore =
    Weight_Journal * JournalScore +
    Weight_Impact * ImpactScore;

  const PaperScoreAdj = Math.min(PaperScore * role, 100);

  return {
    C95,
    JournalBase,
    JournalScore,
    ImpactScore,
    PaperScore,
    PaperScoreAdj
};
}

module.exports = { calculateScore };