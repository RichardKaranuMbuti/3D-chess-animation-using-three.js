# 3D Chess Board Animation

An interactive 3D chess board visualization using Three.js, featuring animated pawns that move dynamically across the board and to captured positions.

## Features

- 3D chess board with realistic materials and lighting
- Animated pawn movements with smooth transitions
- Multiple camera angles for different viewing perspectives
- Pawns can move between the board and captured positions
- Interactive orbit controls for custom viewing angles

## Technologies Used

- Three.js for 3D rendering
- ES6 Modules
- Custom OBJ model loading
- CSS for UI elements
- Vanilla JavaScript for animations

## Prerequisites

Before running this project, make sure you have:

- Node.js and npm installed
- Visual Studio Code
- python3 to run server and expose ports

## Installation

1. Clone the repository or download the project files

```bash
git@github.com:RichardKaranuMbuti/3D-chess-animation-using-three.js.git
```

2. Open terminal in the project directory and run:

```bash
npm install
```

3. While in base_dir run

```python
python3 -m http.server 8000

```

- The project typically runs at `http://0.0.0.0:8000/`
- This will start a local server and open the project in your default browser

## Running the Project

To access round_2 version of the project :

- click the project folder saved as round_2

- or you can directly visit `http://0.0.0.0:8000/round_2/`

## Controls

- **Mouse Controls:**

  - Mouse: Left-click drag to rotate
  - Mouse wheel: Zoom

- **Keyboard Controls:**
  - 0: Top view
  - 1: White player view
  - 2: Black player view
  - 3: Side view
  - R: Reset pieces
  - Space: Start/Stop animation

## How It Works

1. Initial Setup:

   - White and black pawns are loaded and placed outside the board
   - The board is created with alternating colored squares
   - Multiple camera positions are set up for different viewing angles

2. Animation Sequence:
   - Pawns gradually move onto the board
   - Random movements occur between board positions
   - All movements feature smooth, arcing animations

## Technical Details

- The board is an 8x8 grid of squares
- Each pawn is loaded as an OBJ model with custom materials
- Positions are tracked using a coordinate system
- Animations use interpolation for smooth movement
- Shadow mapping is enabled for realistic lighting
- Responsive design adapts to window resizing

## Troubleshooting

If you encounter issues:

1. Make sure all files are in the correct directory structure
2. Verify that the Live Server extension is properly installed
3. Check the browser console for any error messages
4. Ensure all Three.js dependencies are properly loaded
5. Clear browser cache if changes aren't reflected

## Contributing

Feel free to fork this project and submit pull requests with improvements:

- Additional chess pieces
- Enhanced animations
- New features
- Bug fixes
- Performance improvements

## License

This project is open source and available under the MIT License.
