import { api } from "boot/axios";

export const fetchUserFromSearch = async (searchValue: string) => {
  try {
    const response = await api.get("/api/search-user-by-field", {
      params: { search: searchValue },
    });

    if (response.data.length > 0) {
      return response.data.map((user) => ({ ...user }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
