export const handleTermPopUp = () => {
    
    const modal = document.querySelector(".modal");
    const closeModal = document.querySelector(".close");
    
    modal.style.display = "block";
    
    closeModal.onclick = () => {
        modal.style.display = "none";
    }
    
    window.onclick = function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    }
}