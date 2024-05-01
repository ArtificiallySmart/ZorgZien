// legend settings
export const legendConfig = {
  // dots with team colors
  dots: {
    centerX: 25,
    firstCenterY: 100,
    radius: 7,
    spaceBetween: 25,
    centerY: (i: number) => {
      return (
        legendConfig.dots.firstCenterY + i * legendConfig.dots.spaceBetween
      );
    },
  },
  spaceBetweenDotsAndText: 10,
  // team names
  text: {
    get startX() {
      return (
        legendConfig.dots.centerX +
        legendConfig.dots.radius +
        legendConfig.spaceBetweenDotsAndText
      );
    },
    centerY: (i: number) => {
      return legendConfig.dots.centerY(i);
    },
  },
};
