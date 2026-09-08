export const calculateDDay = (weddingDate: Date): number => {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const targetDate = new Date(weddingDate);
	targetDate.setHours(0, 0, 0, 0);

	const timeDifference = targetDate.getTime() - today.getTime();
	const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

	return dayDifference;
};

export const formatDate = (date: Date, format: string = "YYYY-MM-DD"): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return format
		.replace("YYYY", String(year))
		.replace("MM", month)
		.replace("DD", day)
		.replace("HH", hours)
		.replace("mm", minutes);
};
