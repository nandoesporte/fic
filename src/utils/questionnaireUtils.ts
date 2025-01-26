export const getBgColor = (type: string) => {
  switch (type) {
    case 'strengths':
      return 'bg-[#228B22]';
    case 'challenges':
      return 'bg-[#FFD700]';
    case 'opportunities':
      return 'bg-[#000080]';
    default:
      return '';
  }
};

export const MAX_SELECTIONS = 3;

export const splitOptions = (content: string): string[] => {
  return content.split('\n\n').filter(Boolean);
};