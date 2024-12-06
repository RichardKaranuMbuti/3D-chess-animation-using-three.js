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
- Live Server extension for VS Code

## Project Structure

```
3d-chess/
├── index.html
├── styles.css
├── chess.js
└── models/
    └── pawn.obj
```

## Installation

1. Clone the repository or download the project files

2. Open terminal in the project directory and run:
```bash
npm install
```

3. Install the Live Server extension in VS Code:
   - Open VS Code
   - Click on Extensions icon (or press Ctrl+Shift+X)
   - Search for "Live Server"
   - Install the extension by Ritwick Dey

## Running the Project

1. Open the project folder in VS Code

2. Right-click on `index.html` in the VS Code file explorer

3. Select "Open with Live Server"
   - This will start a local server and open the project in your default browser
   - The project typically runs at `http://127.0.0.1:5500` or similar

## Controls

- **Mouse Controls:**
  - Left click + drag: Rotate camera
  - Right click + drag: Pan camera
  - Scroll wheel: Zoom in/out

- **Keyboard Controls:**
  - `0`: Top view
  - `1`: Player 1 view (white side)
  - `2`: Player 2 view (black side)
  - `3`: Side view

## How It Works

1. Initial Setup:
   - White and black pawns are loaded and placed outside the board
   - The board is created with alternating colored squares
   - Multiple camera positions are set up for different viewing angles

2. Animation Sequence:
   - Pawns gradually move onto the board
   - Random movements occur between board positions
   - Pieces can be "captured" and moved to outside positions
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
