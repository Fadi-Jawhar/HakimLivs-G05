
const tbody = document.querySelector(".table-body");

const fetchUser = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`https://hakim-livs-g05-be.vercel.app/api/user/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await response.json();
   return data
}
const fetchOrderHistory = async () => {

    const token = localStorage.getItem("token");
    const response = await fetch("https://hakim-livs-g05-be.vercel.app/api/order", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = response.ok ? await response.json() : [];
    const rows = await Promise.all(
        data.map(async (order) => {
          const user = await fetchUser(order.user);
          return `
            <tr>
              <td>${order._id}</td>
              <td>${user.username}</td>
              <td>${order.totalAmount}</td>
              <td>${new Date(order.createdAt).toLocaleString()}</td>
              <td>${user.lojaltyBonus ? 'Trogen kund' : 'Ej trogen kund'}</td>
            </tr>`;
        })
      );
      tbody.innerHTML = rows.join("");

}
fetchOrderHistory()

