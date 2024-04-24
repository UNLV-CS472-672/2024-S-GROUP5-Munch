export function getCurrentDateTime(): string {
  const date = new Date();
  const isoString = date.toISOString();
  const formattedDate = isoString.replace('T', ' ').replace('Z', '+00:00');
  return formattedDate;
}

export const getDateDifference = (creation_date: string) => {
  const currentDate = new Date();
  const creationDate = new Date(creation_date);

  const diff = currentDate.getTime() - creationDate.getTime();
  const diffInMinutes = Math.floor(diff / (1000 * 60));

  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  } else if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  } else if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  } else if (diffInMinutes < 1) {
    return `Just now`;
  }
};
