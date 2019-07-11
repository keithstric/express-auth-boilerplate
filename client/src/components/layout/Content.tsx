import React from 'react';

const Content = (props: any) => {
	return (
		<main className="appPageContainer">
			{props.children}
		</main>
	);
}

export default Content;
