$(() => {
  $('#signupModal').on('shown.bs.modal', function() {
    $('#name').focus()
  });

  $("#loginModal").on('shown.bs.modal', function() {
    $("#email").focus();
  })
});