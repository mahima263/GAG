<?php 
include('data.php');
$Purpose = "Annual Gift Programme";
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Wall of Donors</title>
  <style>
    :root {
      --primary-color: #B04B34;
      --hover-border: #B04B34;
    }

    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333;
    }

    .banner {
      position: relative;
      background: url('walls.jpeg') center/cover no-repeat;
      height: 300px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      text-shadow: 1px 1px 5px rgba(0,0,0,0.7);
      padding: 0 20px;
      text-align: center;
    }

    .banner::before {
      content: "";
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 0;
    }

    .banner h1,
    .banner p {
      position: relative;
      z-index: 1;
      margin: 0;
    }

    .banner h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }

    .banner p {
      font-size: 16px;
      color: #fff3f0;
    }

    .buttons {
      margin: 20px 0;
      text-align: center;
    }

    .btn {
      background: #B04B34;
      color: white;
      padding: 14px 18px;
      margin: 6px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: 0.3s ease;
      width: 85%;
      max-width: 300px;
    }

    .btn:hover {
      background: #932D20;
    }

    #totalPledges {
      font-size: 16px;
      margin-bottom: 10px;
      font-weight: bold;
      text-align: center;
    }

    .pledge-wall {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 20px;
      max-width: 100%;
      box-sizing: border-box;
    }

    .pledge-card {
      background: var(--primary-color);
      border-radius: 6px;
      color: white;
      box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.15);
      height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: 0.3s ease;
      padding: 10px;
      text-align: center;
    }

    .pledge-card:hover {
      background-color: white;
      color: black;
      border-bottom: 4px solid var(--hover-border);
    }

    .name {
      font-size: 14px;
      font-weight: bold;
    }

    .date {
      font-size: 12px;
      font-style: italic;
      opacity: 0.8;
    }

    /* Tablet Layout */
    @media (min-width: 600px) {
      .banner {
        height: 400px;
      }

      .banner h1 {
        font-size: 36px;
      }

      .banner p {
        font-size: 18px;
      }

      .pledge-wall {
        grid-template-columns: repeat(3, 1fr);
        padding: 30px;
      }

      .btn {
        font-size: 18px;
        padding: 16px 20px;
      }
    }

    /* Desktop Layout */
    @media (min-width: 992px) {
      .pledge-wall {
        grid-template-columns: repeat(6, 1fr);
        padding: 40px;
        max-width: 1400px;
        margin: auto;
      }

      .btn {
        width: auto;
        margin: 5px 10px;
      }
    }
  </style>
</head>
<body>

  <!-- Top Banner -->
  <div class="banner">
    <h1>Wall of Donors</h1>
    <p>Celebrating the generous spirit of our alumni and well-wishers</p>
  </div>

  <!-- Buttons -->
 

  <!-- Total Counter -->
  <div id="totalPledges"><br/><br/>Annual Giving Donors (FY 25-26): <?php echo donor_count($Purpose,'2025-26'); ?></div>

  <!-- Wall Display -->
  <div class="pledge-wall">
    
    <?php get_donors_donations($Purpose, 'name_asc', '2025-26'); ?>
  </div>

</body>
</html>
