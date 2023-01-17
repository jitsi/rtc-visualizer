import React from 'react'
import styled from 'styled-components'
import gear from './gear.svg'

const Inline = styled.div`
  display: inline-block;
`

const Container = styled.span`
  align-items: center;
  display: flex;
  justify-content: center;
`

const Text = styled.span`
  font-size: ${props => props.size};
`

const Image = styled.img`
  margin-right: 4px;

  width: ${props => props.size}px;
`

export default ({ children, size = 16 }) => (
  <Inline>
    <Container>
      <Image src={gear} size={size} />
      {children && <Text size={size}>{children}</Text>}
    </Container>
  </Inline>
)
